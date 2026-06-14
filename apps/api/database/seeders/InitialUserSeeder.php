<?php

namespace Database\Seeders;

use App\Models\AgentSante;
use App\Models\CentreSante;
use App\Models\StatutVaccinal;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class InitialUserSeeder extends Seeder
{
    /**
     * Données de référence et comptes de connexion uniquement — pas de patients fictifs.
     */
    public function run(): void
    {
        $this->call(VaccinMaliSeeder::class);

        StatutVaccinal::firstOrCreate(
            ['code' => 'ADMINISTRE'],
            ['libelle' => 'Administré']
        );

        $centre = CentreSante::firstOrCreate(
            ['nom' => 'Centre de Santé de Référence (Bamako)'],
            [
                'centreId' => (string) Str::uuid(),
                'zoneSanitaire' => 'Bamako',
            ]
        );

        AgentSante::firstOrCreate(
            ['matricule' => 'ADM-001'],
            [
                'agentId' => (string) Str::uuid(),
                'nom' => 'Admin Vaccin-Track',
                'password' => Hash::make('admin123'),
                'role' => 'ADMIN',
                'centreId' => $centre->centreId,
            ]
        );

        AgentSante::firstOrCreate(
            ['matricule' => 'AGT-001'],
            [
                'agentId' => (string) Str::uuid(),
                'nom' => 'Dr. Oumar Konaté',
                'password' => Hash::make('agent123'),
                'role' => 'AGENT',
                'centreId' => $centre->centreId,
            ]
        );
    }
}
