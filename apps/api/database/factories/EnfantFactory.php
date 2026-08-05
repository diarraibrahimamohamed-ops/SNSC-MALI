<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Enfant;
use App\Models\CentreSante;
use App\Models\Tuteur;
use Illuminate\Support\Str;

class EnfantFactory extends Factory
{
    protected $model = Enfant::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'identifiant_sanitaire' => 'SAN-' . $this->faker->unique()->randomNumber(5),
            'tuteur_principal_id' => Tuteur::factory(),
            'centre_sante_id' => CentreSante::factory(),
            'nom' => $this->faker->lastName(),
            'prenom' => $this->faker->firstName(),
            'age_mois' => $this->faker->numberBetween(0, 24),
            'date_naissance' => $this->faker->date(),
            'sexe' => $this->faker->randomElement(['M', 'F']),
            'statut_vaccinal_global' => 'INCONNU',
            'cree_le' => now(),
        ];
    }
}
