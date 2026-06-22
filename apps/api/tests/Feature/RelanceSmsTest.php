<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\DossierEnfant;
use App\Models\AgentSante;
use App\Models\NotificationSMS;
use App\Models\RendezVousVaccinal;
use App\Models\CentreSante;
use App\Models\Tuteur;
use App\Models\CalendrierVaccinal;
use App\Models\DosePlanifie;
use App\Modules\PlanVaccinal\Services\CalendrierPevService;
use Illuminate\Support\Str;

class RelanceSmsTest extends TestCase
{
    use RefreshDatabase;

    protected AgentSante $agent;

    protected function setUp(): void
    {
        parent::setUp();

        $centre = CentreSante::create([
            'centreId' => (string) Str::uuid(),
            'nom' => 'Centre SMS',
            'zoneSanitaire' => 'Test',
        ]);

        $this->agent = AgentSante::create([
            'agentId' => (string) Str::uuid(),
            'nom' => 'Agent SMS',
            'matricule' => 'AGT-SMS-' . rand(1000, 9999),
            'password' => bcrypt('password'),
            'role' => 'AGENT',
            'centreId' => $centre->centreId,
        ]);
    }

    public function test_peut_voir_liste_des_relances(): void
    {
        $this->creerNotification();

        $response = $this->actingAs($this->agent, 'api')
            ->getJson('/api/relances-sms');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'telephone',
                        'message',
                        'statut',
                        'date_envoi',
                        'enfant' => ['id', 'nom', 'prenom'],
                    ],
                ],
            ]);
    }

    public function test_peut_declencher_relances_manuelles(): void
    {
        $enfant = $this->creerEnfantAvecRdv();

        $response = $this->actingAs($this->agent, 'api')
            ->postJson('/api/relances-sms/declencher', [
                'enfant_ids' => [$enfant->enfantId],
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Relances déclenchées avec succès',
            ]);
    }

    private function creerEnfantAvecRdv(): DossierEnfant
    {
        $centre = CentreSante::first();
        $tuteur = Tuteur::create([
            'tuteurId' => (string) Str::uuid(),
            'nomComplet' => 'Parent Test',
            'telephone' => '+22371234567',
        ]);

        $enfant = DossierEnfant::create([
            'enfantId' => (string) Str::uuid(),
            'identifiantSanitaire' => 'SAN-SMS-' . rand(1000, 9999),
            'nom' => 'Enfant',
            'prenom' => 'SMS',
            'dateNaissance' => now()->subMonths(2),
            'sexe' => 'M',
            'tuteurId' => $tuteur->tuteurId,
            'centreId' => $centre->centreId,
        ]);

        $calendrier = CalendrierVaccinal::create([
            'calendrierId' => (string) Str::uuid(),
            'dateCreation' => now(),
            'enfantId' => $enfant->enfantId,
        ]);

        $this->seed(\Database\Seeders\VaccinMaliSeeder::class);
        app(CalendrierPevService::class)->genererDosesPlanifiees($enfant, $calendrier);

        $dose = DosePlanifie::where('calendrierId', $calendrier->calendrierId)->first();

        RendezVousVaccinal::create([
            'rdvId' => (string) Str::uuid(),
            'datePrevue' => now()->addDay(),
            'dateRelancePrevue' => now(),
            'enfantId' => $enfant->enfantId,
            'doseId' => $dose->doseId,
        ]);

        return $enfant;
    }

    private function creerNotification(): void
    {
        $enfant = $this->creerEnfantAvecRdv();
        $rdv = RendezVousVaccinal::where('enfantId', $enfant->enfantId)->first();

        NotificationSMS::create([
            'notificationId' => (string) Str::uuid(),
            'dateEnvoi' => now(),
            'statutLivraison' => 'ENVOYE',
            'rdvId' => $rdv->rdvId,
        ]);
    }
}
