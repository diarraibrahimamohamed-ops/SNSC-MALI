<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AgentSante;
use App\Support\PdmApiMapper;
use Illuminate\Support\Facades\Hash;

class AgentController extends Controller
{
    public function index()
    {
        $agents = AgentSante::with('centreSante')
            ->get()
            ->map(fn ($a) => PdmApiMapper::agent($a));

        return response()->json(['data' => $agents]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'nullable|string|max:255',
            'nom_complet' => 'nullable|string|max:255',
            'matricule' => 'required|string|unique:AgentSante,matricule',
            'password' => 'required|string|min:6',
            'telephone' => 'nullable|string',
            'role' => 'nullable|string',
            'centre_sante_id' => 'required|string|exists:CentreSante,centreId',
        ]);

        $nom = $data['nom'] ?? $data['nom_complet'] ?? null;
        if (empty($nom)) {
            return response()->json(['message' => 'Le champ nom ou nom_complet est requis.'], 422);
        }

        $agent = AgentSante::create([
            'agentId' => (string) \Str::uuid(),
            'nom' => $nom,
            'matricule' => $data['matricule'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'] ?? 'AGENT',
            'centreId' => $data['centre_sante_id'],
        ]);

        $agent->load('centreSante');

        return response()->json(['data' => PdmApiMapper::agent($agent)], 201);
    }
}
