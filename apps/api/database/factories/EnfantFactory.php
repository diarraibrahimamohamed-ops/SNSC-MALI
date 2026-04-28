<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Enfant;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Enfant>
 */
class EnfantFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Enfant::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => $this->faker->uuid(),
            'nom' => $this->faker->lastName(),
            'prenom' => $this->faker->firstName(),
            'date_naissance' => $this->faker->dateTimeBetween('-5 years', 'now'),
            'sexe' => $this->faker->randomElement(['M', 'F']),
            'lieu_naissance' => $this->faker->city(),
            'centre_sante_id' => \App\Models\CentreSante::factory(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
