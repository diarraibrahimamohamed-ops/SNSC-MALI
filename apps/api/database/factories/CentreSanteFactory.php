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
            'uuid' => $this->faker->uuid(),
            'nom' => $this->faker->company(),
            'adresse' => $this->faker->address(),
            'telephone' => $this->faker->phoneNumber(),
            'email' => $this->faker->companyEmail(),
            'ville' => $this->faker->city(),
            'region' => $this->faker->state(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
