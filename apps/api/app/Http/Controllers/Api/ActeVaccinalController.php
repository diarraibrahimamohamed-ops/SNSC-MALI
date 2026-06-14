<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ActeVaccinal;
use App\Models\DossierEnfant;
use App\Models\StatutVaccinal;
use App\Models\Vaccin;
use App\Modules\PlanVaccinal\Services\ValidationDoseService;
use App\Support\PdmApiMapper;
use Carbon\Carbon;

class ActeVaccinalController extends Controller
{
    public function index()
    {
        $actes = ActeVaccinal::all()->map(fn ($a) => PdmApiMapper::acte($a));

        return response()->json(['data' => $actes]);
    }

    public function store(Request $request, ValidationDoseService $validationService)
    {
        $data = $request->validate([
            'enfant_id' => 'required|string|exists:DossierEnfant,enfantId',
            'vaccin_id' => 'required|string',
            'agent_id' => 'required|string|exists:AgentSante,agentId',
            'centre_sante_id' => 'nullable|string|exists:CentreSante,centreId',
            'administre_le' => 'required|date|before_or_equal:today',
            'numero_lot' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $vaccin = Vaccin::where('vaccinId', $data['vaccin_id'])->first();
        if (! $vaccin) {
            return response()->json([
                'message' => 'Vaccin introuvable. Exécutez : php artisan db:seed --class=VaccinMaliSeeder',
            ], 422);
        }

        $enfant = DossierEnfant::where('enfantId', $data['enfant_id'])->firstOrFail();
        $user = auth('api')->user();
        if ($user && $user->role !== 'ADMIN' && $user->centreId && $enfant->centreId !== $user->centreId) {
            return response()->json(['message' => 'Vous ne pouvez vacciner que les enfants de votre centre.'], 403);
        }

        $validation = $validationService->valider(
            $enfant,
            $vaccin,
            Carbon::parse($data['administre_le'])
        );

        if (! $validation['eligible']) {
            return response()->json([
                'message' => $validation['message'],
                'errors' => ['vaccin_id' => [$validation['message']]],
                'validation' => $validation,
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
