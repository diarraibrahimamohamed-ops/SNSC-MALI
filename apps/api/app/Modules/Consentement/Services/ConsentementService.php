<?php

namespace App\Modules\Consentement\Services;

use App\Models\Consentement;

class ConsentementService
{
    public function smsAutorise(string $sujetType, string $sujetId): bool
    {
        return Consentement::query()
            ->where('sujet_type', $sujetType)
            ->where('sujet_id', $sujetId)
            ->where('finalite', 'SMS_RENDEZ_VOUS')
            ->where('statut', 'ACTIF')
            ->whereNull('retire_le')
            ->exists();
    }
}
