<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vaccin;
use Illuminate\Support\Str;

class VaccinSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vaccins = [
            ['code' => 'BCG', 'nom' => 'BCG', 'maladie_cible' => 'Tuberculose'],
            ['code' => 'DTP', 'nom' => 'DTP', 'maladie_cible' => 'Diphtérie, Tétanos, Coqueluche'],
            ['code' => 'POLIO', 'nom' => 'Polio', 'maladie_cible' => 'Poliomyélite'],
            ['code' => 'ROUGEOLE', 'nom' => 'Rougeole', 'maladie_cible' => 'Rougeole'],
            ['code' => 'HB', 'nom' => 'Hépatite B', 'maladie_cible' => 'Hépatite B'],
        ];

        foreach ($vaccins as $vaccin) {
            Vaccin::updateOrCreate(
                ['code' => $vaccin['code']],
                array_merge($vaccin, ['id' => Str::uuid()])
            );
        }
    }
}
