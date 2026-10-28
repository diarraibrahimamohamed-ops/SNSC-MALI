<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Consentement;
use App\Models\DossierEnfant;
use App\Models\PersonneMere;
use App\Models\Tuteur;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use App\Modules\SanteMaternelle\Services\AuditCliniqueService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

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
        if (! $centreId) {
            throw ValidationException::withMessages([
                'centre_sante_id' => ['Une structure doit être explicitement associée à ce consentement.'],
            ]);
        }
        $acces->verifierCentre($centreId);

        if ($data['sujet_type'] === 'MERE') {
            $sujet = PersonneMere::findOrFail($data['sujet_id']);
            if ($sujet->centre_sante_id !== $centreId) {
                throw new AuthorizationException('Le consentement doit être enregistré dans la structure propriétaire du dossier mère.');
            }
        } else {
            $tuteur = Tuteur::where('tuteurId', $data['sujet_id'])->firstOrFail();
            $tuteurRelieAuCentre = DossierEnfant::where('tuteurId', $tuteur->tuteurId)
                ->where('centreId', $centreId)
                ->exists();

            if (! $tuteurRelieAuCentre) {
                throw new AuthorizationException('Le tuteur ne possède aucun dossier enfant dans cette structure.');
            }
        }

        $consentement = Consentement::create([
            'sujet_type' => $data['sujet_type'],
            'sujet_id' => $data['sujet_id'],
            'finalite' => $data['finalite'],
            'version_notice' => $data['version_notice'],
            'canal' => $data['canal'],
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

        if ($element->statut !== 'ACTIF' || $element->retire_le !== null) {
            return response()->json(['data' => $element], 200);
        }

        $element->update(['statut' => 'RETIRE', 'retire_le' => now()]);
        $audit->journaliser('RETRAIT_CONSENTEMENT', 'Consentement', $element->id, $element->centre_sante_id);

        return response()->json(['data' => $element->refresh()]);
    }
}
