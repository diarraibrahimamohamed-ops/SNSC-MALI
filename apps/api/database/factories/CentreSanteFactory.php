<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\CentreSante;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CentreSante>
 */
class CentreSanteFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = CentreSante::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => (string) $this->faker->uuid(),
            'nom' => $this->faker->company(),
            'adresse' => $this->faker->address(),
            'code_zone' => $this->faker->postcode(),
            'capacite' => $this->faker->numberBetween(10, 100),
            'cree_le' => now(),
        ];
    }
}
