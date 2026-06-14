<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ActeVaccinal;
use App\Models\StatutVaccinal;
use App\Models\Vaccin;
use App\Support\PdmApiMapper;

class ActeVaccinalController extends Controller
{
    public function index()
    {
        $actes = ActeVaccinal::all()->map(fn ($a) => PdmApiMapper::acte($a));

        return response()->json(['data' => $actes]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'enfant_id' => 'required|string|exists:DossierEnfant,enfantId',
            'vaccin_id' => 'required|string',
            'agent_id' => 'required|string|exists:AgentSante,agentId',
            'centre_sante_id' => 'nullable|string|exists:CentreSante,centreId',
            'administre_le' => 'required|date',
            'numero_lot' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        if (! Vaccin::where('vaccinId', $data['vaccin_id'])->exists()) {
            return response()->json([
                'message' => 'Vaccin introuvable. Exécutez : php artisan db:seed --class=VaccinMaliSeeder',
            ], 422);
        }

        $statutCode = 'ADMINISTRE';
        StatutVaccinal::firstOrCreate(
            ['code' => $statutCode],
            ['libelle' => 'Administré']
        );

        $acte = ActeVaccinal::create([
            'acteId' => (string) \Str::uuid(),
            'dateActe' => date('Y-m-d H:i:s', strtotime($data['administre_le'])),
            'lotVaccin' => $data['numero_lot'] ?? null,
            'enfantId' => $data['enfant_id'],
            'vaccinId' => $data['vaccin_id'],
            'statutCode' => $statutCode,
            'agentId' => $data['agent_id'],
        ]);

        return response()->json(['data' => PdmApiMapper::acte($acte)], 201);
    }
}
