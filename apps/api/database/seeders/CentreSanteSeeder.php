<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CentreSante;

class CentreSanteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CentreSante::factory()->count(10)->create();
    }
}
