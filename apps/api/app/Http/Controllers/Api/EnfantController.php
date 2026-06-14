<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DossierEnfant;
use App\Models\CalendrierVaccinal;
use App\Support\PdmApiMapper;

class EnfantController extends Controller
{
    public function index()
    {
        $user = auth('api')->user();
        $query = DossierEnfant::with([
            'tuteur',
            'centreSante',
            'actesVaccinaux',
            'calendrierVaccinal.dosesPlanifiees',
        ]);

        if ($user && $user->role !== 'ADMIN' && $user->centreId) {
            $query->where('centreId', $user->centreId);
        }

        $enfants = $query->get()->map(fn ($e) => PdmApiMapper::enfant($e));

        return response()->json(['data' => $enfants]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'identifiant_sanitaire' => 'required|string|max:100',
            'date_naissance' => 'required|date',
            'sexe' => 'required|string|max:20',
            'tuteur_principal_id' => 'required|string|exists:Tuteur,tuteurId',
            'centre_sante_id' => 'required|string|exists:CentreSante,centreId',
            'nom' => 'nullable|string|max:255',
            'prenom' => 'nullable|string|max:255',
        ]);

        $user = auth('api')->user();
        if ($user && $user->role !== 'ADMIN' && $user->centreId && $data['centre_sante_id'] !== $user->centreId) {
            return response()->json(['message' => 'Vous ne pouvez enregistrer que des enfants de votre centre.'], 403);
        }

        $enfantId = (string) \Str::uuid();

        $enfant = DossierEnfant::create([
            'enfantId' => $enfantId,
            'identifiantSanitaire' => $data['identifiant_sanitaire'],
            'nom' => $data['nom'] ?? null,
            'prenom' => $data['prenom'] ?? null,
            'dateNaissance' => date('Y-m-d H:i:s', strtotime($data['date_naissance'])),
            'sexe' => $data['sexe'],
            'tuteurId' => $data['tuteur_principal_id'],
            'centreId' => $data['centre_sante_id'],
        ]);

        CalendrierVaccinal::create([
            'calendrierId' => (string) \Str::uuid(),
            'dateCreation' => now(),
            'enfantId' => $enfantId,
        ]);

        $enfant->load(['actesVaccinaux', 'calendrierVaccinal.dosesPlanifiees']);

        return response()->json(['data' => PdmApiMapper::enfant($enfant)], 201);
    }
}
