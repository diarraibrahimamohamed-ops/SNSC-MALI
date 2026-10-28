<?php

namespace App\Modules\SanteMaternelle\Services;

use App\Models\JournalAuditClinique;
use Illuminate\Support\Str;

/** Écrit un évènement minimal, sans contenu clinique ni identité directe dans les métadonnées. */
class AuditCliniqueService
{
    public function journaliser(
        string $action,
        string $sujetType,
        string $sujetId,
        ?string $centreSanteId,
        string $resultat = 'SUCCES',
        array $metadonneesMinimales = [],
    ): void {
        $acteur = auth('api')->user();

        JournalAuditClinique::create([
            'id' => (string) Str::uuid(),
            'acteur_id' => $acteur?->agentId,
            'action' => $action,
            'sujet_type' => $sujetType,
            'sujet_id' => $sujetId,
            'centre_sante_id' => $centreSanteId,
            'resultat' => $resultat,
            'correlation_id' => request()?->header('X-Correlation-ID'),
            'metadonnees_minimales' => $metadonneesMinimales ?: null,
            'survenu_le' => now(),
        ]);
    }
}
