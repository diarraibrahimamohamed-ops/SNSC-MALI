<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seeder principal: appelle les seeders spécifiques
        // On appelle explicitement InitialUserSeeder pour créer admins, agents, vaccins et données de test.
        $this->call([
            InitialUserSeeder::class,
            // Ajoute d'autres seeders ici si nécessaires, par exemple:
            // PermissionSeeder::class,
        ]);
    }
}
