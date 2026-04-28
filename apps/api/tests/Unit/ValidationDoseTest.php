<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Modules\PlanVaccinal\Services\ValidationDoseService;
use App\Models\Enfant;
use App\Models\ActeVaccinal;
use App\Models\Vaccin;
use Carbon\Carbon;

class ValidationDoseTest extends TestCase
{
    protected ValidationDoseService $validationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->validationService = new ValidationDoseService();
    }

    public function test_valide_dose_correcte(): void
    {
        $enfant = Enfant::factory()->create([
            'date_naissance' => Carbon::now()->subMonths(2)
        ]);
        
        $vaccin = Vaccin::factory()->create();

        $isValid = $this->validationService->validerDose($enfant, $vaccin, 1);

        $this->assertTrue($isValid);
    }

    public function test_rejette_dose_trop_tot(): void
    {
        $enfant = Enfant::factory()->create([
            'date_naissance' => Carbon::now()->subWeeks(1) // Tôt pour BCG
        ]);
        
        $vaccin = Vaccin::factory()->create(['nom' => 'BCG']);

        $isValid = $this->validationService->validerDose($enfant, $vaccin, 1);

        $this->assertFalse($isValid);
    }

    public function test_valide_intervalle_entre_doses(): void
    {
        $enfant = Enfant::factory()->create([
            'date_naissance' => Carbon::now()->subMonths(3)
        ]);
        
        $vaccin = Vaccin::factory()->create();

        // Première dose il y a 1 mois
        ActeVaccinal::factory()->create([
            'enfant_id' => $enfant->id,
            'vaccin_id' => $vaccin->id,
            'dose' => 1,
            'date_vaccination' => Carbon::now()->subMonth()
        ]);

        $isValid = $this->validationService->validerDose($enfant, $vaccin, 2);

        $this->assertTrue($isValid);
    }

    public function test_rejette_dose_sans_intervalle_suffisant(): void
    {
        $enfant = Enfant::factory()->create([
            'date_naissance' => Carbon::now()->subMonths(3)
        ]);
        
        $vaccin = Vaccin::factory()->create();

        // Première dose il y a 1 semaine (tôt pour deuxième dose)
        ActeVaccinal::factory()->create([
            'enfant_id' => $enfant->id,
            'vaccin_id' => $vaccin->id,
            'dose' => 1,
            'date_vaccination' => Carbon::now()->subWeek()
        ]);

        $isValid = $this->validationService->validerDose($enfant, $vaccin, 2);

        $this->assertFalse($isValid);
    }
}
