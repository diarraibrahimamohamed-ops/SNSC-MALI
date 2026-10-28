<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Grossesse;
use App\Models\MesureClinique;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use App\Modules\SanteMaternelle\Services\AuditCliniqueService;
use Illuminate\Http\Request;

class MesureCliniqueController extends Controller
{
    public function index(string $grossesse, AccesParStructureService $acces)
    {
        $dossier = Grossesse::findOrFail($grossesse);
        $acces->verifierCentre($dossier->centre_sante_id);

        return response()->json([
            'data' => $dossier->mesures()->orderByDesc('mesuree_le')->paginate(50),
        ]);
    }

    public function store(
        Request $request,
        string $grossesse,
        AccesParStructureService $acces,
        AuditCliniqueService $audit
    ) {
        $data = $request->validate([
            'type_mesure' => ['required', 'string', 'max:100'],
            'valeur' => ['required', 'numeric'],
            'unite' => ['required', 'string', 'max:30'],
            'mesuree_le' => ['required', 'date', 'before_or_equal:now'],
            'methode' => ['nullable', 'string', 'max:100'],
            'source_donnee' => ['nullable', 'string', 'max:100'],
        ]);

        $dossier = Grossesse::findOrFail($grossesse);
        $acces->verifierCentre($dossier->centre_sante_id);

        $mesure = MesureClinique::create([
            ...$data,
            'grossesse_id' => $dossier->id,
            'auteur_id' => $acces->utilisateur()?->agentId,
            'source_donnee' => $data['source_donnee'] ?? 'SAISIE_AGENT',
            'statut_validation' => 'A_VERIFIER',
        ]);

        $audit->journaliser(
            'CREATION_MESURE_CLINIQUE',
            'MesureClinique',
            $mesure->id,
            $dossier->centre_sante_id,
        );

        return response()->json(['data' => $mesure], 201);
    }
}
