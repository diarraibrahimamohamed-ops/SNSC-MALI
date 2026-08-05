<?php

namespace Database\Factories;

use App\Models\Enfant;
use App\Models\NotificationSms;
use App\Models\RendezVous;
use App\Models\Tuteur;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class NotificationSmsFactory extends Factory
{
    protected $model = NotificationSms::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'enfant_id' => Enfant::factory(),
            'tuteur_id' => Tuteur::factory(),
            'rendez_vous_id' => RendezVous::factory(),
            'numero_telephone' => $this->faker->phoneNumber(),
            'contenu_message' => $this->faker->sentence(),
            'statut_livraison' => 'ENVOYE',
            'envoye_le' => now(),
        ];
    }
}
