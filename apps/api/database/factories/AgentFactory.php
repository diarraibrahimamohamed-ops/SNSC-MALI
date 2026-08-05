<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Agent;
use App\Models\CentreSante;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AgentFactory extends Factory
{
    protected $model = Agent::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'centre_sante_id' => CentreSante::factory(),
            'nom_complet' => $this->faker->name(),
            'matricule' => 'AGT-' . $this->faker->unique()->randomNumber(5),
            'password' => Hash::make('password'),
            'role' => 'agent',
            'telephone' => $this->faker->phoneNumber(),
            'est_actif' => true,
        ];
    }
}
