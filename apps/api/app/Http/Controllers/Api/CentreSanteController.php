<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CentreSante;

class CentreSanteController extends Controller
{
    public function index()
    {
        $centres = CentreSante::all();
        return response()->json(['data' => $centres]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'zoneSanitaire' => 'required|string|max:255'
        ]);

        $centre = CentreSante::create([
            'centreId' => (string) \Str::uuid(),
            'nom' => $data['nom'],
            'zoneSanitaire' => $data['zoneSanitaire']
        ]);

        return response()->json(['data' => $centre], 201);
    }
}
