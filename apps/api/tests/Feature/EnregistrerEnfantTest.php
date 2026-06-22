<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\CentreSante;
use App\Models\AgentSante;
use App\Models\Tuteur;
use App\Models\DossierEnfant;
use Illuminate\Support\Str;

class EnregistrerEnfantTest extends TestCase
{
    use RefreshDatabase;

    protected AgentSante $agent;
    protected CentreSante $centre;
    protected Tuteur $tuteur;

    protected function setUp(): void
    {
        parent::setUp();

        $this->centre = CentreSante::create([
            'centreId' => (string) Str::uuid(),
            'nom' => 'Centre Test',
            'zoneSanitaire' => 'Bamako',
        ]);

        $this->agent = AgentSante::create([
            'agentId' => (string) Str::uuid(),
            'nom' => 'Agent Test',
            'matricule' => 'AGT-' . rand(1000, 9999),
            'password' => bcrypt('password'),
            'role' => 'AGENT',
            'centreId' => $this->centre->centreId,
        ]);

        $this->tuteur = Tuteur::create([
            'tuteurId' => (string) Str::uuid(),
            'nomComplet' => 'Tuteur Test',
            'telephone' => '+22370123456',
        ]);

        $this->seed(\Database\Seeders\VaccinMaliSeeder::class);
    }

    public function test_peut_enregistrer_un_enfant(): void
    {
        $enfantData = [
            'identifiant_sanitaire' => 'SAN-' . rand(1000, 9999),
            'nom' => 'Doe',
            'prenom' => 'John',
            'date_naissance' => '2023-01-01',
            'sexe' => 'M',
            'tuteur_principal_id' => $this->tuteur->tuteurId,
            'centre_sante_id' => $this->centre->centreId,
        ];

        $response = $this->actingAs($this->agent, 'api')
            ->postJson('/api/enfants', $enfantData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'identifiant_sanitaire',
                    'nom',
                    'prenom',
                    'sexe',
                    'date_naissance',
                    'statut_vaccinal_global',
                ],
                'prochaine_echeance',
            ]);
    }

    public function test_ne_peut_pas_enregistrer_enfant_sans_auth(): void
    {
        $enfantData = [
            'identifiant_sanitaire' => 'SAN-FAIL',
            'nom' => 'Doe',
            'prenom' => 'Fail',
            'date_naissance' => '2023-01-01',
            'sexe' => 'M',
            'tuteur_principal_id' => $this->tuteur->tuteurId,
            'centre_sante_id' => $this->centre->centreId,
        ];

        $response = $this->postJson('/api/enfants', $enfantData);

        $response->assertStatus(401);
    }

    public function test_refuse_doublon_identifiant_sanitaire(): void
    {
        DossierEnfant::create([
            'enfantId' => (string) Str::uuid(),
            'identifiantSanitaire' => 'SAN-DUP',
            'dateNaissance' => '2023-01-01',
            'sexe' => 'M',
            'tuteurId' => $this->tuteur->tuteurId,
            'centreId' => $this->centre->centreId,
        ]);

        $response = $this->actingAs($this->agent, 'api')
            ->postJson('/api/enfants', [
                'identifiant_sanitaire' => 'SAN-DUP',
                'date_naissance' => '2023-06-01',
                'sexe' => 'F',
                'tuteur_principal_id' => $this->tuteur->tuteurId,
                'centre_sante_id' => $this->centre->centreId,
            ]);

        $response->assertStatus(422);
    }
}
