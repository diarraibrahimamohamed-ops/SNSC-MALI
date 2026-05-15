<?php

namespace Database\Factories;

use App\Models\Enfant;
use App\Models\DoseCalendrierEnfant;
use App\Models\RendezVous;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class RendezVousFactory extends Factory
{
    protected $model = RendezVous::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'enfant_id' => Enfant::factory(),
            'dose_calendrier_enfant_id' => DoseCalendrierEnfant::factory(),
            'date_cible' => $this->faker->dateTimeBetween('now', '+1 month'),
            'statut' => 'PROGRAMME',
            'cree_le' => now(),
        ];
    }
}
