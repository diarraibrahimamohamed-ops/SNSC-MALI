<?php

namespace App\Modules\PlanVaccinal\Services;

use Carbon\Carbon;

class LotVaccinValidator
{
    /**
     * Valide un numéro de lot vaccinal.
     * Formats acceptés : LOT-YYYYMMDD-XXX ou LOT-XXX (sans date d'expiration vérifiable).
     *
     * @return array{valide: bool, message: string}
     */
    public function valider(?string $numeroLot): array
    {
        if ($numeroLot === null || trim($numeroLot) === '') {
            return ['valide' => true, 'message' => ''];
        }

        $numeroLot = trim($numeroLot);

        if (! preg_match('/^LOT-[A-Z0-9\-]+$/i', $numeroLot)) {
            return [
                'valide' => false,
                'message' => 'Numéro de lot invalide. Format attendu : LOT-YYYYMMDD-XXX ou LOT-XXX.',
            ];
        }

        if (preg_match('/LOT-(\d{8})-/i', $numeroLot, $matches)) {
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
