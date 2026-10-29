<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CreateTestUsers extends Seeder
{
    public function run()
    {
        // Créer ou mettre à jour l'utilisateur admin
        DB::table('users')->updateOrInsert(
            ['matricule' => 'ADM-001'],
            [
                'name' => 'Administrateur',
                'email' => 'admin@vaccin-track.ml',
                'password' => Hash::make('admin123'),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Créer ou mettre à jour l'utilisateur agent
        DB::table('users')->updateOrInsert(
            ['matricule' => 'AGT-001'],
            [
                'name' => 'Agent Vaccination',
                'email' => 'agent@vaccin-track.ml',
                'password' => Hash::make('agent123'),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $this->command->info('Utilisateurs de test créés/mis à jour :');
        $this->command->info('  - Admin: matricule ADM-001 / mot de passe admin123');
        $this->command->info('  - Agent: matricule AGT-001 / mot de passe agent123');
    }
}
