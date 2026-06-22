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
        // 1. Créer ou récupérer un centre de santé
        $centre = CentreSante::firstOrCreate(
            ['code_zone' => 'CSREF-BKO'],
            [
                'id' => (string) Str::uuid(),
                'nom' => 'Centre de Santé de Référence (Bamako)',
                'region' => 'Bamako',
                'ville' => 'Bamako',
                'adresse' => 'Quartier du Fleuve, Bamako',
                'capacite' => 500,
            ]
        );

        // 2. Créer ou mettre à jour les comptes
        $admin = Agent::updateOrCreate(
            ['matricule' => 'ADM-001'],
            [
                'id' => (string) Str::uuid(),
                'centre_sante_id' => $centre->id,
                'nom_complet' => 'Admin Vaccin-Track',
                'password' => Hash::make('admin123'),
                'role' => 'ADMIN',
                'telephone' => '22370000001',
                'est_actif' => true,
            ]
        );

        $agent = Agent::updateOrCreate(
            ['matricule' => 'AGT-001'],
            [
                'id' => (string) Str::uuid(),
                'centre_sante_id' => $centre->id,
                'nom_complet' => 'Dr. Oumar Konaté',
                'password' => Hash::make('agent123'),
                'role' => 'AGENT',
                'telephone' => '22370000002',
                'est_actif' => true,
            ]
        );

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
            $enfant = Enfant::firstOrCreate(
                ['identifiant_sanitaire' => 'MLI-' . (1000 + $index)],
                [
                    'id' => (string) Str::uuid(),
                    'nom' => $data['nom'],
                    'prenom' => $data['prenom'],
                    'date_naissance' => $data['date_naissance'],
                    'sexe' => $data['sexe'],
                    'centre_sante_id' => $centre->id,
                    'statut_vaccinal_global' => 'A_JOUR',
                ]
            );

            // Ajouter un acte vaccinal pour certains
            if (rand(0, 1)) {
                ActeVaccinal::firstOrCreate(
                    [
                        'enfant_id' => $enfant->id,
                        'vaccin_id' => $bcg->id,
                        'agent_id' => $agent->id,
                        'administre_le' => $data['date_naissance']->copy()->addDays(1),
                    ],
                    [
                        'id' => (string) Str::uuid(),
                        'dose_calendrier_enfant_id' => null,
                        'centre_sante_id' => $centre->id,
                        'numero_lot' => 'LOT-' . rand(100, 999),
                        'notes' => null,
                        'cree_le' => Carbon::now(),
                    ]
                );
            }
        }
    }
}
