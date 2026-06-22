<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tuteur;
use App\Support\PdmApiMapper;

class TuteurController extends Controller
{
    public function index()
    {
        $tuteurs = Tuteur::all()->map(fn ($t) => PdmApiMapper::tuteur($t));

        return response()->json(['data' => $tuteurs]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id' => 'nullable|uuid',
            'nom_complet' => 'required|string|max:255',
            'telephone' => 'required|string|max:30',
        ]);

        $tuteurId = $data['id'] ?? (string) \Str::uuid();

        $tuteur = Tuteur::create([
            'tuteurId' => $tuteurId,
            'nomComplet' => $data['nom_complet'],
            'telephone' => $data['telephone'],
        ]);

        return response()->json(['data' => PdmApiMapper::tuteur($tuteur)], 201);
    }
}
