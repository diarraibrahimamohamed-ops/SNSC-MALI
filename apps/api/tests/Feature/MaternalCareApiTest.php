<?php

namespace Tests\Feature;

use App\Models\AgentSante;
use App\Models\CentreSante;
use App\Models\EvenementSynchronisation;
use App\Models\PersonneMere;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class MaternalCareApiTest extends TestCase
{
    use RefreshDatabase;

    private CentreSante $centreA;
    private CentreSante $centreB;
    private AgentSante $agentA;
    private AgentSante $agentB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->centreA = $this->centre('CSCOM A');
        $this->centreB = $this->centre('CSREF B');
        $this->agentA = $this->agent($this->centreA, 'AGT-MAT-A');
        $this->agentB = $this->agent($this->centreB, 'AGT-MAT-B');
    }

    public function test_parcours_mere_grossesse_contact_est_isole_par_structure(): void
    {
        $mereResponse = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/meres', [
            'nom' => 'Traore',
            'prenom' => 'Aminata',
            'identifiant_sanitaire' => 'MERE-001',
            'langue_preferee' => 'bm',
        ]);
        $mereResponse->assertCreated();
        $mereId = $mereResponse->json('data.id');

        $grossesseResponse = $this->actingAs($this->agentA, 'api')->postJson("/api/v1/meres/{$mereId}/grossesses", [
            'date_debut_estimee' => now()->subMonths(4)->toDateString(),
            'terme_estime' => now()->addMonths(5)->toDateString(),
            'nombre_foetus' => 1,
            'version_protocole' => 'A_VALIDER',
        ]);
        $grossesseResponse->assertCreated();
        $grossesseId = $grossesseResponse->json('data.id');

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/grossesses/{$grossesseId}/contacts", [
            'contact_le' => now()->subHour()->toIso8601String(),
            'type_contact' => 'CPN',
            'age_gestationnel_semaines' => 18,
            'prochaine_etape' => 'Rendez-vous à confirmer selon protocole validé.',
        ])->assertCreated();

        $this->actingAs($this->agentA, 'api')->getJson("/api/v1/meres/{$mereId}/chronologie")
            ->assertOk()
            ->assertJsonFragment(['type' => 'CONTACT_PRENATAL']);

        $this->actingAs($this->agentB, 'api')->getJson("/api/v1/meres/{$mereId}")
            ->assertForbidden();
    }

    public function test_reference_suit_les_transitions_controlees(): void
    {
        $mere = PersonneMere::create([
            'id' => (string) Str::uuid(),
            'nom' => 'Diallo',
            'centre_sante_id' => $this->centreA->centreId,
            'source_donnee' => 'TEST',
            'collecte_le' => now(),
            'auteur_id' => $this->agentA->agentId,
        ]);

        $creation = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/references', [
            'patient_type' => 'MERE',
            'patient_id' => $mere->id,
            'centre_destinataire_id' => $this->centreB->centreId,
            'motif_code' => 'EVALUATION_CLINIQUE',
            'priorite' => 'URGENTE',
        ]);
        $creation->assertCreated()->assertJsonPath('data.statut', 'CREEE');
        $referenceId = $creation->json('data.id');

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/references/{$referenceId}/envoyer")
            ->assertOk()->assertJsonPath('data.statut', 'ENVOYEE');
        $this->actingAs($this->agentB, 'api')->postJson("/api/v1/references/{$referenceId}/accuse-reception")
            ->assertOk()->assertJsonPath('data.statut', 'RECUE');
        $this->actingAs($this->agentB, 'api')->patchJson("/api/v1/references/{$referenceId}/issue", ['statut' => 'PRISE_EN_CHARGE_CONFIRMEE'])
            ->assertOk()->assertJsonPath('data.statut', 'PRISE_EN_CHARGE_CONFIRMEE');
    }

    public function test_sync_replay_is_idempotent(): void
    {
        $eventId = (string) Str::uuid();
        $payload = [
            'device_id' => 'android-test-01',
            'events' => [[
                'event_id' => $eventId,
                'idempotency_key' => 'android-test-01:1',
                'schema_version' => '1.0',
                'type' => 'mere.creee',
                'aggregate_type' => 'PersonneMere',
                'aggregate_id' => (string) Str::uuid(),
                'occurred_at' => now()->subMinute()->toIso8601String(),
                'payload' => ['hash_only' => true],
                'centre_sante_id' => $this->centreA->centreId,
            ]],
        ];

        $this->actingAs($this->agentA, 'api')->postJson('/api/v1/mobile/sync', $payload)
            ->assertOk()->assertJsonPath('data.0.statut', 'ACCEPTE');
        $this->actingAs($this->agentA, 'api')->postJson('/api/v1/mobile/sync', $payload)
            ->assertOk()->assertJsonPath('data.0.statut', 'DEJA_TRAITE');

        $this->assertSame(1, EvenementSynchronisation::count());
    }

    private function centre(string $nom): CentreSante
    {
        return CentreSante::create([
            'centreId' => (string) Str::uuid(),
            'nom' => $nom,
            'zoneSanitaire' => 'Bamako',
        ]);
    }

    private function agent(CentreSante $centre, string $matricule): AgentSante
    {
        return AgentSante::create([
            'agentId' => (string) Str::uuid(),
            'nom' => $matricule,
            'matricule' => $matricule,
            'password' => bcrypt('password'),
            'role' => 'AGENT',
            'centreId' => $centre->centreId,
        ]);
    }
}
