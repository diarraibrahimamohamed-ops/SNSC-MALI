<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Modules\PlanVaccinal\Services\GenerateurCalendrierService;
use App\Models\Enfant;
use App\Models\ModeleCalendrier;
use App\Models\Vaccin;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

class GenerateurCalendrierTest extends TestCase
{
    use RefreshDatabase;

    protected GenerateurCalendrierService $generateur;

    protected function setUp(): void
    {
        parent::setUp();
        $this->generateur = new GenerateurCalendrierService();
        
        // Créer des modèles de calendrier pour les tests
        Vaccin::factory()->count(3)->create()->each(function ($vaccin) {
            ModeleCalendrier::factory()->create(['vaccin_id' => $vaccin->id]);
        });
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
            $this->assertObjectHasProperty('vaccin_id', $dose);
            $this->assertObjectHasProperty('date_prevue', $dose);
            $this->assertObjectHasProperty('dose_numero', $dose);
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
                $enfant->date_naissance->toDateString(),
                $dose->date_prevue->toDateString()
            );
        }
    }
}
