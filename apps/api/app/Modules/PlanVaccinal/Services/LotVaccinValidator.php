<?php

namespace App\Modules\PlanVaccinal\Services;

use Carbon\Carbon;

class LotVaccinValidator
{
    /**
     * Valide un numéro de lot vaccinal (formats courants PEV Mali).
     * Exemples acceptés : PNT-MALI-001, BCG-MALI-001, LOT-20261201-ABC
     *
     * @return array{valide: bool, message: string}
     */
    public function valider(?string $numeroLot): array
    {
        if ($numeroLot === null || trim($numeroLot) === '') {
            return ['valide' => true, 'message' => ''];
        }

        $numeroLot = trim($numeroLot);

        if (strlen($numeroLot) < 3 || strlen($numeroLot) > 100) {
            return [
                'valide' => false,
                'message' => 'Numéro de lot invalide (3 à 100 caractères).',
            ];
        }

        if (! preg_match('/^[A-Za-z0-9][A-Za-z0-9\-]*$/', $numeroLot)) {
            return [
                'valide' => false,
                'message' => 'Numéro de lot invalide. Utilisez lettres, chiffres et tirets (ex. PNT-MALI-001).',
            ];
        }

        if (preg_match('/-(\d{8})-/i', $numeroLot, $matches)) {
            $expiration = Carbon::createFromFormat('Ymd', $matches[1]);
            if ($expiration && $expiration->lt(Carbon::today())) {
                return [
                    'valide' => false,
                    'message' => "Le lot « {$numeroLot} » est périmé (expiration : {$expiration->format('d/m/Y')}).",
                ];
            }
        }

        return ['valide' => true, 'message' => ''];
    }
}
