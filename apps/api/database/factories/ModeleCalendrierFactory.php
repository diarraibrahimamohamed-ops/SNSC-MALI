<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\ModeleCalendrier;
use App\Models\Vaccin;
use Illuminate\Support\Str;

class ModeleCalendrierFactory extends Factory
{
    protected $model = ModeleCalendrier::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'vaccin_id' => Vaccin::factory(),
            'numero_dose' => 1,
            'age_min_jours' => 0,
            'age_recommandee_jours' => 0,
            'age_max_jours' => 30,
            'rattrapage_autorise' => true,
        ];
    }
}
