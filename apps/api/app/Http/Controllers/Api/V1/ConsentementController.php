<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Consentement;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use App\Modules\SanteMaternelle\Services\AuditCliniqueService;
use Illuminate\Http\Request;

class ConsentementController extends Controller
{
    public function store(Request $request, AccesParStructureService $acces, AuditCliniqueService $audit)
    {
        $data = $request->validate([
            'sujet_type' => ['required', 'in:MERE,TUTEUR'],
            'sujet_id' => ['required', 'uuid'],
            'finalite' => ['required', 'in:SMS_RENDEZ_VOUS,RECHERCHE,PARTAGE_INTERSYSTEME'],
            'version_notice' => ['required', 'string', 'max:100'],
            'canal' => ['required', 'in:ORAL,ECRIT,NUMERIQUE'],
            'centre_sante_id' => ['nullable', 'uuid', 'exists:CentreSante,centreId'],
        ]);
        $centreId = $data['centre_sante_id'] ?? $acces->centreCourant();
        $acces->verifierCentre($centreId);

        $consentement = Consentement::create([
            ...$data,
            'centre_sante_id' => $centreId,
            'auteur_id' => $acces->utilisateur()?->agentId,
            'statut' => 'ACTIF',
            'consenti_le' => now(),
        ]);

        $audit->journaliser('CREATION_CONSENTEMENT', 'Consentement', $consentement->id, $centreId);

        return response()->json(['data' => $consentement], 201);
    }

    public function retrait(string $consentement, AccesParStructureService $acces, AuditCliniqueService $audit)
    {
        $element = Consentement::findOrFail($consentement);
        $acces->verifierCentre($element->centre_sante_id);
        $element->update(['statut' => 'RETIRE', 'retire_le' => now()]);
        $audit->journaliser('RETRAIT_CONSENTEMENT', 'Consentement', $element->id, $element->centre_sante_id);

        return response()->json(['data' => $element->refresh()]);
    }
}
