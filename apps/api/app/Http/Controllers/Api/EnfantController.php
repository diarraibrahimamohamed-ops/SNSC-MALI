<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DossierEnfant;
use App\Models\CalendrierVaccinal;

class EnfantController extends Controller
{
    public function index()
    {
        $enfants = DossierEnfant::with(['tuteur', 'centreSante'])->get()->map(function($e) {
            $e->id = $e->enfantId;
            $e->nom = "Enfant";
            $e->prenom = "N° " . substr($e->enfantId, 0, 4);
            $e->identifiant_sanitaire = $e->identifiantSanitaire;
            $e->date_naissance = $e->dateNaissance;
            return $e;
        });
        return response()->json(['data' => $enfants]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'identifiant_sanitaire' => 'required|string|max:100',
            'date_naissance' => 'required|date',
            'sexe' => 'required|string|max:20',
            'tuteur_principal_id' => 'required|string',
            'centre_sante_id' => 'required|string',
        ]);

        $enfantId = (string) \Str::uuid();

        $enfant = DossierEnfant::create([
            'enfantId' => $enfantId,
            'identifiantSanitaire' => $data['identifiant_sanitaire'],
            'dateNaissance' => date('Y-m-d H:i:s', strtotime($data['date_naissance'])),
            'sexe' => $data['sexe'],
            'tuteurId' => $data['tuteur_principal_id'],
            'centreId' => $data['centre_sante_id'],
        ]);

        // Auto-generate CalendrierVaccinal
        CalendrierVaccinal::create([
            'calendrierId' => (string) \Str::uuid(),
            'dateCreation' => now(),
            'enfantId' => $enfantId
        ]);

        return response()->json(['data' => $enfant], 201);
    }
}
