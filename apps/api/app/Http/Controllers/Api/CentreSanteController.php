<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CentreSante;
use App\Support\PdmApiMapper;

class CentreSanteController extends Controller
{
    public function index()
    {
        $centres = CentreSante::all()->map(fn ($c) => PdmApiMapper::centre($c));

        return response()->json(['data' => $centres]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'zoneSanitaire' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:255',
        ]);

        $centre = CentreSante::create([
            'centreId' => (string) \Str::uuid(),
            'nom' => $data['nom'],
            'zoneSanitaire' => $data['zoneSanitaire'] ?? $data['region'] ?? 'Non renseignée',
        ]);

        return response()->json(['data' => PdmApiMapper::centre($centre)], 201);
    }
}
