<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ActeVaccinal;
use App\Models\StatutVaccinal;

class ActeVaccinalController extends Controller
{
    public function index()
    {
        $actes = ActeVaccinal::all();
        return response()->json(['data' => $actes]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'enfant_id' => 'required|string',
            'vaccin_id' => 'required|string',
            'agent_id' => 'required|string',
            'administre_le' => 'required|date',
            'numero_lot' => 'nullable|string|max:100'
        ]);

        // Ensure StatutVaccinal exists (e.g. 'ADMINISTRE')
        $statutCode = 'ADMINISTRE';
        if (!StatutVaccinal::find($statutCode)) {
            StatutVaccinal::create(['code' => $statutCode, 'libelle' => 'Administré']);
        }

        $acte = ActeVaccinal::create([
            'acteId' => (string) \Str::uuid(),
            'dateActe' => date('Y-m-d H:i:s', strtotime($data['administre_le'])),
            'lotVaccin' => $data['numero_lot'] ?? null,
            'enfantId' => $data['enfant_id'],
            'vaccinId' => $data['vaccin_id'],
            'statutCode' => $statutCode,
            'agentId' => $data['agent_id'],
        ]);

        return response()->json(['data' => $acte], 201);
    }
}
