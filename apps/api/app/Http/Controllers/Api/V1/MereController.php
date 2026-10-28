<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Maternelle\StoreMereRequest;
use App\Models\PersonneMere;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use App\Modules\SanteMaternelle\Services\AuditCliniqueService;
use App\Modules\SanteMaternelle\Services\ChronologieMereEnfantService;
use Illuminate\Http\Request;

class MereController extends Controller
{
    public function index(Request $request, AccesParStructureService $acces)
    {
        $query = $acces->appliquer(PersonneMere::query(), 'centre_sante_id')->whereNull('archive_le');

        if ($request->filled('q')) {
            $terme = trim((string) $request->query('q'));
            $query->where(function ($recherche) use ($terme) {
                $recherche->where('nom', 'like', "%{$terme}%")
                    ->orWhere('prenom', 'like', "%{$terme}%")
                    ->orWhere('identifiant_sanitaire', 'like', "%{$terme}%");
            });
        }

        return response()->json(['data' => $query->orderBy('nom')->paginate(min((int) $request->query('per_page', 25), 100))]);
    }

    public function store(StoreMereRequest $request, AccesParStructureService $acces, AuditCliniqueService $audit)
    {
        $data = $request->validated();
        $centreId = $data['centre_sante_id'] ?? $acces->centreCourant();
        $acces->verifierCentre($centreId);

        $mere = PersonneMere::create([
            ...$data,
            'centre_sante_id' => $centreId,
            'auteur_id' => $acces->utilisateur()?->agentId,
            'collecte_le' => now(),
            'source_donnee' => $data['source_donnee'] ?? 'SAISIE_AGENT',
        ]);

        $audit->journaliser('CREATION_MERE', 'PersonneMere', $mere->id, $centreId);

        return response()->json(['data' => $mere], 201);
    }

    public function show(string $mere, AccesParStructureService $acces)
    {
        $dossier = PersonneMere::with(['grossesses.accouchement', 'liensEnfants.enfant'])->findOrFail($mere);
        $acces->verifierCentre($dossier->centre_sante_id);

        return response()->json(['data' => $dossier]);
    }

    public function chronologie(string $mere, AccesParStructureService $acces, ChronologieMereEnfantService $chronologie)
    {
        $dossier = PersonneMere::findOrFail($mere);
        $acces->verifierCentre($dossier->centre_sante_id);

        return response()->json(['data' => $chronologie->pour($dossier)]);
    }
}
