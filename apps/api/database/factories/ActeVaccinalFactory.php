<?php

namespace Database\Factories;

use App\Models\ActeVaccinal;
use App\Models\Agent;
use App\Models\CentreSante;
use App\Models\DoseCalendrierEnfant;
use App\Models\Enfant;
use App\Models\Vaccin;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ActeVaccinalFactory extends Factory
{
    protected $model = ActeVaccinal::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'enfant_id' => Enfant::factory(),
            'vaccin_id' => Vaccin::factory(),
            'dose_calendrier_enfant_id' => DoseCalendrierEnfant::factory(),
            'agent_id' => Agent::factory(),
            'centre_sante_id' => CentreSante::factory(),
            'administre_le' => now(),
            'numero_lot' => $this->faker->bothify('LOT-####??'),
            'notes' => $this->faker->sentence(),
            'cree_le' => now(),
        ];
    }
}
