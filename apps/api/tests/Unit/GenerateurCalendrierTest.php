<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Modules\PlanVaccinal\Services\GenerateurCalendrierService;
use App\Models\Enfant;
use App\Models\ModeleCalendrier;
use Carbon\Carbon;

class GenerateurCalendrierTest extends TestCase
{
    protected GenerateurCalendrierService $generateur;

    protected function setUp(): void
    {
        parent::setUp();
        $this->generateur = new GenerateurCalendrierService();
    }

    public function test_genere_calendrier_pour_nouveau_ne(): void
    {
        $enfant = Enfant::factory()->create([
            'date_naissance' => Carbon::now()->subMonths(2)
        ]);

        $calendrier = $this->generateur->genererCalendrier($enfant);

        $this->assertNotEmpty($calendrier);
        $this->assertGreaterThan(0, $calendrier->count());
        
        foreach ($calendrier as $dose) {
            $this->assertObjectHasAttribute('vaccin_id', $dose);
            $this->assertObjectHasAttribute('date_prevue', $dose);
            $this->assertObjectHasAttribute('dose_numero', $dose);
        }
    }

    public function test_date_prevue_est_apres_naissance(): void
    {
        $enfant = Enfant::factory()->create([
            'date_naissance' => Carbon::now()->subMonths(3)
        ]);

        $calendrier = $this->generateur->genererCalendrier($enfant);

        foreach ($calendrier as $dose) {
            $this->assertGreaterThanOrEqual(
                $enfant->date_naissance,
                $dose->date_prevue
            );
        }
    }
}
