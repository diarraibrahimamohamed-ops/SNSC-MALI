<?php

namespace Database\Seeders;

use App\Models\Vaccin;
use Illuminate\Database\Seeder;

class VaccinMaliSeeder extends Seeder
{
    /**
     * Vaccins alignés sur apps/web/src/constants/vaccins.ts
     */
    public function run(): void
    {
        $vaccins = [
            ['vaccinId' => '11111111-1111-4111-8111-111111111101', 'code' => 'BCG', 'libelle' => 'BCG + PolioO'],
            ['vaccinId' => '11111111-1111-4111-8111-111111111102', 'code' => 'PENTA_1', 'libelle' => 'Penta1 + Rota1 + PCV13_1'],
            ['vaccinId' => '11111111-1111-4111-8111-111111111103', 'code' => 'VPO_1', 'libelle' => 'VPO1'],
            ['vaccinId' => '11111111-1111-4111-8111-111111111104', 'code' => 'PENTA_2', 'libelle' => 'Penta2 + Rota2 + PCV13_2'],
            ['vaccinId' => '11111111-1111-4111-8111-111111111105', 'code' => 'VPO_2', 'libelle' => 'VPO2'],
            ['vaccinId' => '11111111-1111-4111-8111-111111111106', 'code' => 'PENTA_3', 'libelle' => 'Penta3 + Rota3 + PCV13_3'],
            ['vaccinId' => '11111111-1111-4111-8111-111111111107', 'code' => 'VPO_3', 'libelle' => 'VPO3'],
            ['vaccinId' => '11111111-1111-4111-8111-111111111108', 'code' => 'VPI', 'libelle' => 'VPI'],
            ['vaccinId' => '11111111-1111-4111-8111-111111111109', 'code' => 'VIT_A', 'libelle' => 'VITAMINE A'],
            ['vaccinId' => '11111111-1111-4111-8111-111111111110', 'code' => 'VAR', 'libelle' => 'VAR'],
            ['vaccinId' => '11111111-1111-4111-8111-111111111111', 'code' => 'VAA', 'libelle' => 'VAA'],
            ['vaccinId' => '11111111-1111-4111-8111-111111111112', 'code' => 'MEN_A', 'libelle' => 'Men_AfriVac'],
            ['vaccinId' => '11111111-1111-4111-8111-111111111118', 'code' => 'HPV', 'libelle' => 'HPV'],
        ];

        foreach ($vaccins as $vaccin) {
            Vaccin::updateOrCreate(
                ['vaccinId' => $vaccin['vaccinId']],
                ['code' => $vaccin['code'], 'libelle' => $vaccin['libelle']]
            );
        }
    }
}
