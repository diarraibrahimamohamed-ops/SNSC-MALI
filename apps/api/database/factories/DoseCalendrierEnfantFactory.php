<?php

namespace Database\Factories;

use App\Models\Enfant;
use App\Models\ModeleCalendrier;
use App\Models\DoseCalendrierEnfant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class DoseCalendrierEnfantFactory extends Factory
{
    protected $model = DoseCalendrierEnfant::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'enfant_id' => Enfant::factory(),
            'modele_calendrier_id' => ModeleCalendrier::factory(),
            'statut' => 'A_VENIR',
            'date_echeance' => $this->faker->dateTimeBetween('now', '+6 months'),
            'debut_fenetre' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'fin_fenetre' => $this->faker->dateTimeBetween('+6 months', '+12 months'),
        ];
    }
}
