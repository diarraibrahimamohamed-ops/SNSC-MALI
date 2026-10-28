<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Maternelle\StoreAccouchementRequest;
use App\Models\DossierEnfant;
use App\Models\EpisodeAccouchement;
use App\Models\Grossesse;
use App\Models\LienMereEnfant;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use App\Modules\SanteMaternelle\Services\AuditCliniqueService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AccouchementController extends Controller
{
    public function store(StoreAccouchementRequest $request, string $grossesse, AccesParStructureService $acces, AuditCliniqueService $audit)
    {
        $dossier = Grossesse::findOrFail($grossesse);
        $acces->verifierCentre($dossier->centre_sante_id);
        $dossier->load('mere');
        $data = $request->validated();
        $centreId = $data['centre_sante_id'] ?? $dossier->centre_sante_id;
        $acces->verifierCentre($centreId);

        if ($dossier->accouchement()->exists()) {
            throw ValidationException::withMessages(['grossesse' => ['Un épisode d’accouchement existe déjà pour cette grossesse.']]);
        }

        $accouchement = DB::transaction(function () use ($dossier, $data, $centreId, $acces) {
            $episode = EpisodeAccouchement::create([
                ...$data,
                'grossesse_id' => $dossier->id,
                'centre_sante_id' => $centreId,
                'auteur_id' => $acces->utilisateur()?->agentId,
                'statut_validation' => 'A_VERIFIER',
                'source_donnee' => $data['source_donnee'] ?? 'SAISIE_AGENT',
            ]);

            foreach ($data['nouveau_ne_enfant_ids'] ?? [] as $enfantId) {
                $enfant = DossierEnfant::findOrFail($enfantId);
                $acces->verifierCentre($enfant->centreId);

                LienMereEnfant::firstOrCreate(
                    ['mere_id' => $dossier->mere_id, 'enfant_id' => $enfant->enfantId, 'type_lien' => 'BIOLOGIQUE'],
                    ['date_debut' => $episode->accouchement_le->toDateString(), 'statut_verification' => 'A_VERIFIER', 'source_donnee' => 'EPISODE_ACCOUCHEMENT', 'auteur_id' => $acces->utilisateur()?->agentId]
                );
            }

            $dossier->update(['statut' => 'ACCOUCHEE']);

            return $episode;
        });

        $audit->journaliser('CREATION_ACCOUCHEMENT', 'EpisodeAccouchement', $accouchement->id, $centreId);

        return response()->json(['data' => $accouchement], 201);
    }
}
