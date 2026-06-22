<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\DossierEnfant;
use App\Models\AgentSante;
use App\Models\Vaccin;
use App\Models\CentreSante;
use App\Models\Tuteur;
use App\Models\CalendrierVaccinal;
use App\Modules\PlanVaccinal\Services\CalendrierPevService;
use Illuminate\Support\Str;

class EnregistrerVaccinationTest extends TestCase
{
    use RefreshDatabase;

    protected AgentSante $agent;
    protected CentreSante $centre;
    protected DossierEnfant $enfant;
    protected Vaccin $vaccin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->centre = CentreSante::create([
            'centreId' => (string) Str::uuid(),
            'nom' => 'Centre Test',
            'zoneSanitaire' => 'Test',
        ]);

        $this->agent = AgentSante::create([
            'agentId' => (string) Str::uuid(),
            'nom' => 'Agent Test',
            'matricule' => 'AGT-VAC-' . rand(1000, 9999),
            'password' => bcrypt('password'),
            'role' => 'AGENT',
            'centreId' => $this->centre->centreId,
        ]);

        $tuteur = Tuteur::create([
            'tuteurId' => (string) Str::uuid(),
            'nomComplet' => 'Tuteur',
            'telephone' => '+22370123456',
        ]);

        $this->enfant = DossierEnfant::create([
            'enfantId' => (string) Str::uuid(),
            'identifiantSanitaire' => 'SAN-VAC-' . rand(1000, 9999),
            'nom' => 'Test',
            'prenom' => 'Enfant',
            'dateNaissance' => now()->subWeeks(8),
            'sexe' => 'M',
            'tuteurId' => $tuteur->tuteurId,
            'centreId' => $this->centre->centreId,
        ]);

        $calendrier = CalendrierVaccinal::create([
            'calendrierId' => (string) Str::uuid(),
            'dateCreation' => now(),
            'enfantId' => $this->enfant->enfantId,
        ]);

        app(CalendrierPevService::class)->genererDosesPlanifiees($this->enfant, $calendrier);

        $this->seed(\Database\Seeders\VaccinMaliSeeder::class);
        $this->vaccin = Vaccin::where('code', 'BCG')->first();
        \App\Models\StatutVaccinal::firstOrCreate(['code' => 'ADMINISTRE'], ['libelle' => 'Administré']);
    }

    public function test_peut_enregistrer_une_vaccination(): void
    {
        $vaccinationData = [
            'enfant_id' => $this->enfant->enfantId,
            'vaccin_id' => $this->vaccin->vaccinId,
            'agent_id' => $this->agent->agentId,
            'centre_sante_id' => $this->centre->centreId,
            'administre_le' => now()->toDateString(),
            'numero_lot' => 'LOT-20261201-ABC',
        ];

        $response = $this->actingAs($this->agent, 'api')
            ->postJson('/api/actes-vaccinaux', $vaccinationData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'administre_le',
                    'enfant_id',
                    'vaccin_id',
                ],
                'prochaine_echeance',
            ]);
    }

    public function test_refuse_lot_perime(): void
    {
        $response = $this->actingAs($this->agent, 'api')
            ->postJson('/api/actes-vaccinaux', [
                'enfant_id' => $this->enfant->enfantId,
                'vaccin_id' => $this->vaccin->vaccinId,
                'agent_id' => $this->agent->agentId,
                'administre_le' => now()->toDateString(),
                'numero_lot' => 'LOT-20200101-EXP',
            ]);

        $response->assertStatus(422);
    }
}
