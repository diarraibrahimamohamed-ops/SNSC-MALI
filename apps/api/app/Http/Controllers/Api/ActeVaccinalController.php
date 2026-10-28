<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ActeVaccinal;
use App\Models\DossierEnfant;
use App\Models\StatutVaccinal;
use App\Models\Vaccin;
use App\Models\AgentSante;
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
        $query = ActeVaccinal::query();
        $user = auth('api')->user();
        if (strtoupper((string) $user?->role) !== 'ADMIN') {
            $enfantIds = DossierEnfant::where('centreId', $user?->centreId ?? '__AUCUN_CENTRE__')->pluck('enfantId');
            $query->whereIn('enfantId', $enfantIds);
        }
        $actes = $query->get()->map(fn ($a) => PdmApiMapper::acte($a));

        return response()->json(['data' => $actes]);
    }

    public function store(
        Request $request,
        ValidationDoseService $validationService,
        LotVaccinValidator $lotValidator,
        RendezVousService $rdvService,
        AuditService $auditService
    ) {
        try {
            $data = $request->validate([
                'enfant_id' => 'required|string|exists:DossierEnfant,enfantId',
                'vaccin_id' => 'required|string',
                'agent_id' => 'required|string|exists:AgentSante,agentId',
                'centre_sante_id' => 'nullable|string|exists:CentreSante,centreId',
                'administre_le' => 'required|date|before_or_equal:today',
                'numero_lot' => 'nullable|string|max:100',
                'notes' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Illuminate\Support\Facades\Log::error('Validation erreur ActeVaccinal: ' . json_encode($e->errors()));
            throw $e;
        }

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
        $agentSante = AgentSante::where('agentId', $data['agent_id'])->firstOrFail();
        $utilisateur = auth('api')->user();
        if (strtoupper((string) $utilisateur?->role) !== 'ADMIN') {
            $centreId = $utilisateur?->centreId;
            if (! $centreId || $enfant->centreId !== $centreId || $agentSante->centreId !== $centreId || $agentSante->agentId !== $utilisateur?->agentId) {
                return response()->json(['message' => 'Vous ne pouvez enregistrer une vaccination que pour votre centre et votre propre compte.'], 403);
            }
            if (! empty($data['centre_sante_id']) && $data['centre_sante_id'] !== $centreId) {
                return response()->json(['message' => 'Le centre indiqué ne correspond pas à votre périmètre.'], 403);
            }
        }

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
