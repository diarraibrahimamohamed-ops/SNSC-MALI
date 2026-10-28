<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Maternelle\StoreSuiviPostpartumRequest;
use App\Models\EpisodeAccouchement;
use App\Models\PersonneMere;
use App\Models\SuiviPostPartum;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use App\Modules\SanteMaternelle\Services\AuditCliniqueService;
use Illuminate\Validation\ValidationException;

class PostpartumController extends Controller
{
    public function store(StoreSuiviPostpartumRequest $request, string $mere, AccesParStructureService $acces, AuditCliniqueService $audit)
    {
        $maman = PersonneMere::findOrFail($mere);
        $acces->verifierCentre($maman->centre_sante_id);
        $data = $request->validated();

        if (! empty($data['accouchement_id'])) {
            $episode = EpisodeAccouchement::with('grossesse')->findOrFail($data['accouchement_id']);
            if ($episode->grossesse->mere_id !== $maman->id) {
                throw ValidationException::withMessages(['accouchement_id' => ['Cet accouchement ne correspond pas à la mère indiquée.']]);
            }
        }

        $suivi = SuiviPostPartum::create([
            ...$data,
            'mere_id' => $maman->id,
            'centre_sante_id' => $maman->centre_sante_id,
            'auteur_id' => $acces->utilisateur()?->agentId,
            'statut_validation' => 'A_VERIFIER',
            'source_donnee' => $data['source_donnee'] ?? 'SAISIE_AGENT',
        ]);

        $audit->journaliser('CREATION_SUIVI_POSTPARTUM', 'SuiviPostPartum', $suivi->id, $maman->centre_sante_id);

        return response()->json(['data' => $suivi], 201);
    }
}
