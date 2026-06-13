<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tuteur;

class TuteurController extends Controller
{
    public function index()
    {
        $tuteurs = Tuteur::all();
        return response()->json(['data' => $tuteurs]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom_complet' => 'required|string|max:255',
            'telephone' => 'required|string|max:30'
        ]);

        $tuteur = Tuteur::create([
            'tuteurId' => (string) \Str::uuid(),
            'nomComplet' => $data['nom_complet'],
            'telephone' => $data['telephone']
        ]);

        return response()->json(['data' => $tuteur], 201);
    }
}
