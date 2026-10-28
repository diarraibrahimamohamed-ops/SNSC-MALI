<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Maternelle\StoreContactPrenatalRequest;
use App\Http\Requests\Maternelle\StoreGrossesseRequest;
use App\Models\ContactPrenatal;
use App\Models\Grossesse;
use App\Models\PersonneMere;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use App\Modules\SanteMaternelle\Services\AuditCliniqueService;

class GrossesseController extends Controller
{
    public function store(StoreGrossesseRequest $request, string $mere, AccesParStructureService $acces, AuditCliniqueService $audit)
    {
        $maman = PersonneMere::findOrFail($mere);
        $acces->verifierCentre($maman->centre_sante_id);
        $data = $request->validated();
        $centreId = $data['centre_sante_id'] ?? $maman->centre_sante_id;
        $acces->verifierCentre($centreId);

        $grossesse = Grossesse::create([
            ...$data,
            'mere_id' => $maman->id,
            'centre_sante_id' => $centreId,
            'auteur_id' => $acces->utilisateur()?->agentId,
            'statut' => 'SUIVI',
            'statut_validation' => 'A_VERIFIER',
            'source_donnee' => $data['source_donnee'] ?? 'SAISIE_AGENT',
        ]);

        $audit->journaliser('CREATION_GROSSESSE', 'Grossesse', $grossesse->id, $centreId);

        return response()->json(['data' => $grossesse], 201);
    }

    public function show(string $grossesse, AccesParStructureService $acces)
    {
        // N'exposer les relations de grossesse qu'après validation du périmètre.
        $dossier = Grossesse::findOrFail($grossesse);
        $acces->verifierCentre($dossier->centre_sante_id);
        $dossier->load(['mere', 'contacts', 'mesures', 'accouchement']);

        return response()->json(['data' => $dossier]);
    }

    public function storeContact(StoreContactPrenatalRequest $request, string $grossesse, AccesParStructureService $acces, AuditCliniqueService $audit)
    {
        $dossier = Grossesse::findOrFail($grossesse);
        $acces->verifierCentre($dossier->centre_sante_id);
        $data = $request->validated();

        $contact = ContactPrenatal::create([
            ...$data,
            'grossesse_id' => $dossier->id,
            'centre_sante_id' => $dossier->centre_sante_id,
            'auteur_id' => $acces->utilisateur()?->agentId,
            'statut_validation' => 'A_VERIFIER',
            'source_donnee' => $data['source_donnee'] ?? 'SAISIE_AGENT',
        ]);

        $audit->journaliser('CREATION_CONTACT_PRENATAL', 'ContactPrenatal', $contact->id, $dossier->centre_sante_id);

        return response()->json(['data' => $contact], 201);
    }
}
