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
            'id' => (string) $this->faker->uuid(),
            'nom_complet' => $this->faker->name(),
            'telephone' => $this->faker->phoneNumber(),
            'adresse' => $this->faker->address(),
            'consentement_donne' => true,
            'cree_le' => now(),
        ];
    }
}
