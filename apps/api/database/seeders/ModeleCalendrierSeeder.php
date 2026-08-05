<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ModeleCalendrier;

class ModeleCalendrierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $calendriers = [
            [
                'nom' => 'Calendrier Vaccinal Standard',
                'description' => 'Calendrier vaccinal recommandé par l\'OMS',
                'age_min_semaines' => 0,
                'age_max_semaines' => 208,
            ],
            [
                'nom' => 'Calendrier Vaccinal Accéléré',
                'description' => 'Calendrier vaccinal avec doses rapprochées',
                'age_min_semaines' => 0,
                'age_max_semaines' => 156,
            ],
        ];

        foreach ($calendriers as $calendrier) {
            ModeleCalendrier::create($calendrier);
        }
    }
}
