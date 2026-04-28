<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Tuteur;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tuteur>
 */
class TuteurFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Tuteur::class;

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
            'telephone' => $this->faker->phoneNumber(),
            'email' => $this->faker->unique()->safeEmail(),
            'adresse' => $this->faker->address(),
            'relation' => $this->faker->randomElement(['Père', 'Mère', 'Tuteur', 'Tutrice']),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
