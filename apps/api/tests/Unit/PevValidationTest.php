<?php

namespace Tests\Unit;

use App\Models\ActeVaccinal;
use App\Models\AgentSante;
use App\Models\CentreSante;
use App\Models\DossierEnfant;
use App\Models\Tuteur;
use App\Models\Vaccin;
use App\Modules\PlanVaccinal\Services\ValidationDoseService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PevValidationTest extends TestCase
{
    use RefreshDatabase;

    private ValidationDoseService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ValidationDoseService();
        $this->seedVaccins();
    }

    public function test_autorise_bcg_a_la_naissance(): void
    {
        $enfant = $this->creerEnfant(Carbon::yesterday());
        $bcg = Vaccin::where('code', 'BCG')->first();

        $result = $this->service->valider($enfant, $bcg, Carbon::today());

        $this->assertTrue($result['eligible']);
    }

    public function test_refuse_penta1_pour_enfant_ne_hier(): void
    {
        $enfant = $this->creerEnfant(Carbon::yesterday());
        $penta1 = Vaccin::where('code', 'PENTA_1')->first();

        $result = $this->service->valider($enfant, $penta1, Carbon::today());

        $this->assertFalse($result['eligible']);
        $this->assertStringContainsString('6 semaines', $result['message']);
    }

    public function test_autorise_penta1_apres_6_semaines(): void
    {
        $enfant = $this->creerEnfant(Carbon::today()->subWeeks(7));
        $penta1 = Vaccin::where('code', 'PENTA_1')->first();

        $result = $this->service->valider($enfant, $penta1, Carbon::today());

        $this->assertTrue($result['eligible']);
    }

    public function test_refuse_penta2_sans_penta1(): void
    {
        $enfant = $this->creerEnfant(Carbon::today()->subMonths(4));
        $penta2 = Vaccin::where('code', 'PENTA_2')->first();

        $result = $this->service->valider($enfant, $penta2, Carbon::today());

        $this->assertFalse($result['eligible']);
        $this->assertStringContainsString('PENTA_1', $result['message']);
    }

    public function test_refuse_doublon_vaccin(): void
    {
        $enfant = $this->creerEnfant(Carbon::today()->subWeeks(7));
        $penta1 = Vaccin::where('code', 'PENTA_1')->first();
        $agent = AgentSante::create([
            'agentId' => (string) Str::uuid(),
            'nom' => 'Agent Test',
            'matricule' => 'TST-001',
            'password' => bcrypt('test'),
            'role' => 'AGENT',
            'centreId' => $enfant->centreId,
        ]);

        ActeVaccinal::create([
            'acteId' => (string) Str::uuid(),
            'dateActe' => Carbon::today()->subWeek(),
            'enfantId' => $enfant->enfantId,
            'vaccinId' => $penta1->vaccinId,
            'statutCode' => 'ADMINISTRE',
            'agentId' => $agent->agentId,
        ]);

        $result = $this->service->valider($enfant, $penta1, Carbon::today());

        $this->assertFalse($result['eligible']);
        $this->assertStringContainsString('déjà été administré', $result['message']);
    }

    private function creerEnfant(Carbon $naissance): DossierEnfant
    {
        $centre = CentreSante::create([
            'centreId' => (string) Str::uuid(),
            'nom' => 'Centre Test',
            'zoneSanitaire' => 'Test',
        ]);

        $tuteur = Tuteur::create([
            'tuteurId' => (string) Str::uuid(),
            'nomComplet' => 'Tuteur Test',
            'telephone' => '22370000000',
        ]);

        return DossierEnfant::create([
            'enfantId' => (string) Str::uuid(),
            'identifiantSanitaire' => 'TEST-' . Str::random(6),
            'nom' => 'Test',
            'prenom' => 'Enfant',
            'dateNaissance' => $naissance,
            'sexe' => 'M',
            'tuteurId' => $tuteur->tuteurId,
            'centreId' => $centre->centreId,
        ]);
    }

    private function seedVaccins(): void
    {
        foreach ([
            ['code' => 'BCG', 'libelle' => 'BCG'],
            ['code' => 'PENTA_1', 'libelle' => 'Penta1'],
            ['code' => 'PENTA_2', 'libelle' => 'Penta2'],
        ] as $v) {
            Vaccin::create([
                'vaccinId' => (string) Str::uuid(),
                'code' => $v['code'],
                'libelle' => $v['libelle'],
            ]);
        }

        \App\Models\StatutVaccinal::create(['code' => 'ADMINISTRE', 'libelle' => 'Administré']);
    }
}
