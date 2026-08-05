<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Vaccin;
use Illuminate\Support\Str;

class VaccinFactory extends Factory
{
    protected $model = Vaccin::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'code' => $this->faker->unique()->word(),
            'nom' => $this->faker->word(),
            'maladie_cible' => $this->faker->word(),
            'est_actif' => true,
        ];
    }
}
