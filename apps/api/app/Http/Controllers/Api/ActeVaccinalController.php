<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ActeVaccinal;
use App\Models\DossierEnfant;
use App\Models\StatutVaccinal;
use App\Models\Vaccin;
use App\Modules\Audit\Services\AuditService;
use App\Modules\PlanVaccinal\Services\LotVaccinValidator;
use App\Modules\PlanVaccinal\Services\ValidationDoseService;
use App\Modules\RendezVous\Services\RendezVousService;
use App\Support\PdmApiMapper;
use Carbon\Carbon;

class ActeVaccinalController extends Controller
{
    public function index()
    {
        $actes = ActeVaccinal::all()->map(fn ($a) => PdmApiMapper::acte($a));

        return response()->json(['data' => $actes]);
    }

    public function store(
        Request $request,
        ValidationDoseService $validationService,
        LotVaccinValidator $lotValidator,
        RendezVousService $rdvService,
        AuditService $auditService
    ) {
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

        $lotValidation = $lotValidator->valider($data['numero_lot'] ?? null);
        if (! $lotValidation['valide']) {
            return response()->json([
                'message' => $lotValidation['message'],
                'errors' => ['numero_lot' => [$lotValidation['message']]],
            ], 422);
        }

        $enfant = DossierEnfant::where('enfantId', $data['enfant_id'])->firstOrFail();

        $dateAdmin = Carbon::parse($data['administre_le']);
        $validation = $validationService->valider($enfant, $vaccin, $dateAdmin);

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
            'dateActe' => $dateAdmin->format('Y-m-d H:i:s'),
            'lotVaccin' => $data['numero_lot'] ?? null,
            'enfantId' => $data['enfant_id'],
            'vaccinId' => $data['vaccin_id'],
            'statutCode' => $statutCode,
            'agentId' => $data['agent_id'],
        ]);

        $enfant->load('calendrierVaccinal');
        $rdvService->marquerDoseAdministree($enfant, $dateAdmin, $data['vaccin_id']);
        $prochainRdv = $rdvService->recalculerProchainRendezVous($enfant);
        $prochaineEcheance = $rdvService->prochaineEcheance($enfant);

        $auditService->journaliser(
            "VACCINATION: {$vaccin->code} administré le {$dateAdmin->format('Y-m-d')}",
            $enfant->enfantId
        );

        return response()->json([
            'data' => PdmApiMapper::acte($acte),
            'prochaine_echeance' => $prochaineEcheance,
            'prochain_rendez_vous' => $prochainRdv,
        ], 201);
    }
}
