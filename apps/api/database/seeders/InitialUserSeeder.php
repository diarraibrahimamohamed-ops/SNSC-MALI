<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Agent;
use App\Models\CentreSante;
use App\Models\Enfant;
use App\Models\Vaccin;
use App\Models\ActeVaccinal;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class InitialUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Créer un centre de santé
        $centre = CentreSante::create([
            'id' => (string) Str::uuid(),
            'nom' => 'Centre de Santé de Référence (Bamako)',
            'region' => 'Bamako',
            'ville' => 'Bamako',
            'code_zone' => 'CSREF-BKO',
            'adresse' => 'Quartier du Fleuve, Bamako',
            'capacite' => 500,
        ]);

        // 2. Créer les comptes
        $admin = Agent::create([
            'id' => (string) Str::uuid(),
            'centre_sante_id' => $centre->id,
            'nom_complet' => 'Admin Vaccin-Track',
            'matricule' => 'ADM-001',
            'password' => Hash::make('admin123'),
            'role' => 'ADMIN',
            'telephone' => '22370000001',
            'est_actif' => true,
        ]);

        $agent = Agent::create([
            'id' => (string) Str::uuid(),
            'centre_sante_id' => $centre->id,
            'nom_complet' => 'Dr. Oumar Konaté',
            'matricule' => 'AGT-001',
            'password' => Hash::make('agent123'),
            'role' => 'AGENT',
            'telephone' => '22370000002',
            'est_actif' => true,
        ]);

        // 3. Créer des Vaccins
        $bcg = Vaccin::firstOrCreate(['code' => 'BCG'], [
            'id' => (string) Str::uuid(),
            'nom' => 'BCG', 
            'maladie_cible' => 'Tuberculose'
        ]);
        $vpo = Vaccin::firstOrCreate(['code' => 'VPO'], [
            'id' => (string) Str::uuid(),
            'nom' => 'VPO', 
            'maladie_cible' => 'Poliomyélite'
        ]);

        // 4. Créer des enfants
        $enfants = [
            ['nom' => 'Keita', 'prenom' => 'Moussa', 'sexe' => 'M', 'date_naissance' => Carbon::now()->subMonths(2)],
            ['nom' => 'Diallo', 'prenom' => 'Fatoumata', 'sexe' => 'F', 'date_naissance' => Carbon::now()->subMonths(6)],
            ['nom' => 'Konaté', 'prenom' => 'Samba', 'sexe' => 'M', 'date_naissance' => Carbon::now()->subDays(10)],
            ['nom' => 'Traoré', 'prenom' => 'Mariam', 'sexe' => 'F', 'date_naissance' => Carbon::now()->subYear()],
        ];

        foreach ($enfants as $index => $data) {
            $enfant = Enfant::create([
                'id' => (string) Str::uuid(),
                'identifiant_sanitaire' => 'MLI-' . (1000 + $index),
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'date_naissance' => $data['date_naissance'],
                'sexe' => $data['sexe'],
                'centre_sante_id' => $centre->id,
                'statut_vaccinal_global' => 'A_JOUR',
            ]);

            // Ajouter un acte vaccinal pour certains
            if (rand(0, 1)) {
                ActeVaccinal::create([
                    'id' => (string) Str::uuid(),
                    'enfant_id' => $enfant->id,
                    'vaccin_id' => $bcg->id,
                    'agent_id' => $agent->id,
                    'date_administration' => $data['date_naissance']->copy()->addDays(1),
                    'dose_numero' => 1,
                    'lot_numero' => 'LOT-' . rand(100, 999),
                    'cree_le' => Carbon::now(),
                ]);
            }
        }
    }
}
