<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DossierEnfant;
use App\Models\CalendrierVaccinal;
use App\Models\CentreSante;
use App\Modules\Audit\Services\AuditService;
use App\Modules\PlanVaccinal\Services\CalendrierPevService;
use App\Modules\RendezVous\Services\RendezVousService;
use App\Support\PdmApiMapper;
use Carbon\Carbon;
use App\Services\EnfantSmsNotificationService;
use App\Services\SmsService;

class EnfantController extends Controller
{
    public function index(Request $request)
    {
        $user = auth('api')->user();
        $query = DossierEnfant::with([
            'tuteur',
            'centreSante',
            'actesVaccinaux',
            'calendrierVaccinal.dosesPlanifiees',
        ]);

        if ($request->filled('identifiant_sanitaire')) {
            $query->where('identifiantSanitaire', $request->query('identifiant_sanitaire'));
        }

        $enfants = $query->get()->map(fn ($e) => PdmApiMapper::enfant($e));

        return response()->json(['data' => $enfants]);
    }

    public function show(string $enfant, CalendrierPevService $calendrierService, RendezVousService $rdvService)
    {
        try {
            $dossier = $this->findEnfantAutorise($enfant);
            $dossier->load([
                'tuteur',
                'centreSante',
                'actesVaccinaux',
                'calendrierVaccinal.dosesPlanifiees',
                'rendezVous.dosePlanifiee',
            ]);

            $calendrier = $calendrierService->calendrierPourEnfant($dossier);
            $prochaineEcheance = $rdvService->prochaineEcheance($dossier);

            return response()->json([
                'data' => [
                    'dossier' => PdmApiMapper::enfant($dossier),
                    'calendrier' => $calendrier,
                    'actes_vaccinaux' => $dossier->actesVaccinaux->map(fn ($a) => PdmApiMapper::acte($a)),
                    'rendez_vous' => $dossier->rendezVous,
                    'statut_vaccinal' => PdmApiMapper::computeStatutVaccinal($dossier),
                    'prochaine_echeance' => $prochaineEcheance,
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'message' => 'Enfant introuvable. Vérifiez l\'identifiant sanitaire et réessayez.',
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Erreur chargement statut vaccinal: ' . $e->getMessage());

            return response()->json([
                'message' => 'Erreur lors du chargement du dossier. Veuillez réessayer ultérieurement.',
            ], 500);
        }
    }

    public function store(
        Request $request,
        CalendrierPevService $calendrierService,
        RendezVousService $rdvService,
        AuditService $auditService,
        SmsService $smsService
    ) {
        $data = $request->validate([
            'identifiant_sanitaire' => 'required|string|max:100',
            'date_naissance' => 'required|date',
            'sexe' => 'required|string|max:20',
            'tuteur_principal_id' => 'required|string|exists:Tuteur,tuteurId',
            'centre_sante_id' => 'required|string',
            'nom' => 'nullable|string|max:255',
            'prenom' => 'nullable|string|max:255',
        ]);

        $user = auth('api')->user();
        if ($user && $user->role !== 'ADMIN' && $user->centreId && $data['centre_sante_id'] !== $user->centreId) {
            return response()->json(['message' => 'Vous ne pouvez enregistrer que des enfants de votre centre.'], 403);
        }

        if (DossierEnfant::where('identifiantSanitaire', $data['identifiant_sanitaire'])->exists()) {
            return response()->json([
                'message' => 'Un dossier avec cet identifiant sanitaire existe déjà. Vérifiez l\'unicité du dossier.',
            ], 422);
        }

        $centres = CentreSante::where('centreId', $data['centre_sante_id'])->get();
        if ($centres->isEmpty()) {
            return response()->json([
                'message' => 'Le centre de santé sélectionné n\'existe pas. Veuillez choisir un centre habilité dans la liste de référence ou contacter l\'administrateur pour la régularisation du référentiel des centres de santé.',
            ], 422);
        }

        $enfantId = (string) \Str::uuid();

        $enfant = DossierEnfant::create([
            'enfantId' => $enfantId,
            'identifiantSanitaire' => $data['identifiant_sanitaire'],
            'nom' => $data['nom'] ?? null,
            'prenom' => $data['prenom'] ?? null,
            'dateNaissance' => date('Y-m-d H:i:s', strtotime($data['date_naissance'])),
            'sexe' => $data['sexe'],
            'tuteurId' => $data['tuteur_principal_id'],
            'centreId' => $data['centre_sante_id'],
        ]);

        $calendrier = CalendrierVaccinal::create([
            'calendrierId' => (string) \Str::uuid(),
            'dateCreation' => now(),
            'enfantId' => $enfantId,
        ]);

        $calendrierService->genererDosesPlanifiees($enfant, $calendrier);
        $rdvService->recalculerProchainRendezVous($enfant);

        $enfant->load(['tuteur', 'actesVaccinaux', 'calendrierVaccinal.dosesPlanifiees']);
        $prochaineEcheance = $rdvService->prochaineEcheance($enfant);

        $avertissements = [];
        $tuteur = $enfant->tuteur;
        if ($tuteur && ! $smsService->validatePhoneNumber($smsService->formatPhoneNumber($tuteur->telephone))) {
            $avertissements[] = 'Numéro de téléphone du parent invalide : enregistrement effectué sans envoi SMS.';
        } else {
            try {
                app(EnfantSmsNotificationService::class)->envoyerConfirmationEnregistrement($enfant);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Erreur SMS confirmation: ' . $e->getMessage());
                $avertissements[] = 'SMS de confirmation non envoyé.';
            }
        }

        $auditService->journaliser(
            "ENREGISTREMENT_ENFANT: {$data['identifiant_sanitaire']}",
            $enfantId
        );

        $response = [
            'data' => PdmApiMapper::enfant($enfant),
            'prochaine_echeance' => $prochaineEcheance,
        ];

        if (! empty($avertissements)) {
            $response['avertissements'] = $avertissements;
        }

        return response()->json($response, 201);
    }

    public function calendrier(string $enfant, CalendrierPevService $calendrierService)
    {
        $dossier = $this->findEnfantAutorise($enfant);

        return response()->json([
            'data' => $calendrierService->calendrierPourEnfant($dossier),
        ]);
    }

    public function vaccinsEligibles(Request $request, string $enfant, CalendrierPevService $calendrierService)
    {
        $dossier = $this->findEnfantAutorise($enfant);
        $date = Carbon::parse($request->query('date', now()->toDateString()));

        return response()->json([
            'data' => $calendrierService->vaccinsEligibles($dossier, $date),
        ]);
    }

    private function findEnfantAutorise(string $enfantId): DossierEnfant
    {
        return DossierEnfant::where('enfantId', $enfantId)->firstOrFail();
    }
}
