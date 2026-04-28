<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vaccin;

class VaccinSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vaccins = [
            ['nom' => 'BCG', 'description' => 'Vaccin contre la tuberculose'],
            ['nom' => 'DTP', 'description' => 'Vaccin contre la diphtérie, tétanos et coqueluche'],
            ['nom' => 'Polio', 'description' => 'Vaccin contre la poliomyélite'],
            ['nom' => 'Rougeole', 'description' => 'Vaccin contre la rougeole'],
            ['nom' => 'Hépatite B', 'description' => 'Vaccin contre l\'hépatite B'],
        ];

        foreach ($vaccins as $vaccin) {
            Vaccin::create($vaccin);
        }
    }
}
