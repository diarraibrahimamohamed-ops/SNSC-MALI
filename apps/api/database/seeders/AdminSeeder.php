<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\CentreSante;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get a random health center for admin assignment
        $centreId = CentreSante::first()?->id;

        // Create or update super admin
        Admin::updateOrCreate(
            ['email' => 'admin@vaccin-track.ml'],
            [
                'id' => Str::uuid(),
                'nom' => 'Admin',
                'prenom' => 'Super',
                'matricule' => 'ADMIN-SUPER-001',
                'password' => Hash::make('admin123'),
                'telephone' => '+223 76000000',
                'role' => 'super_admin',
                'centre_sante_id' => null,
                'est_actif' => true,
            ]
        );

        // Create or update regional admin
        Admin::updateOrCreate(
            ['email' => 'admin-regional@vaccin-track.ml'],
            [
                'id' => Str::uuid(),
                'nom' => 'Admin',
                'prenom' => 'Regional',
                'matricule' => 'ADMIN-REGIONAL-001',
                'password' => Hash::make('admin123'),
                'telephone' => '+223 76111111',
                'role' => 'admin_regional',
                'centre_sante_id' => null,
                'est_actif' => true,
            ]
        );

        // Create or update centre admin
        if ($centreId) {
            Admin::updateOrCreate(
                ['email' => 'admin-centre@vaccin-track.ml'],
                [
                    'id' => Str::uuid(),
                    'nom' => 'Admin',
                    'prenom' => 'Centre',
                    'matricule' => 'ADMIN-CENTRE-001',
                    'password' => Hash::make('admin123'),
                    'telephone' => '+223 76222222',
                    'role' => 'admin_centre',
                    'centre_sante_id' => $centreId,
                    'est_actif' => true,
                ]
            );
        }
    }
}
