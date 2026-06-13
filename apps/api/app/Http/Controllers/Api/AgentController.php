<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AgentSante;
use Illuminate\Support\Facades\Hash;

class AgentController extends Controller
{
    public function index()
    {
        $agents = AgentSante::with('centreSante')->get()->map(function($a) {
            // Frontend mapping support
            $a->nom_complet = $a->nom;
            return $a;
        });
        return response()->json(['data' => $agents]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom_complet' => 'required|string|max:255',
            'matricule' => 'required|string|unique:AgentSante',
            'password' => 'required|string',
            'telephone' => 'nullable|string',
            'role' => 'nullable|string',
            'centre_sante_id' => 'nullable|string'
        ]);

        $agent = AgentSante::create([
            'agentId' => (string) \Str::uuid(),
            'nom' => $data['nom_complet'],
            'matricule' => $data['matricule'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'] ?? 'AGENT',
            'centreId' => $data['centre_sante_id'] ?? null,
        ]);

        return response()->json(['data' => $agent], 201);
    }
}
