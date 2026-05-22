<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Agent;
use App\Models\CentreSante;
use App\Models\Enfant;
use App\Models\ActeVaccinal;
use App\Models\RendezVous;
use App\Models\NotificationSms;
use App\Models\ScoreRisque;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardAdminController extends Controller
{
    /**
     * Retourne les statistiques du dashboard admin avec données réelles
     */
    public function index(): JsonResponse
    {
        if (!auth()->user() instanceof Admin) {
            abort(403, 'Accès non autorisé');
        }

        try {
            // Statistiques générales
            $totalEnfants = Enfant::count();
            $totalCentres = CentreSante::count();
            $totalAgents = Agent::count();
            $totalAdmins = Admin::count();

            // Vaccinations
            $totalActesVaccinaux = ActeVaccinal::count();
            $enfantsVaccines = Enfant::whereHas('actes_vaccinaux')->distinct()->count();
            $tauxCouverture = $totalEnfants > 0 ? ($enfantsVaccines / $totalEnfants * 100) : 0;

            // Rendez-vous
            $totalRendezVous = RendezVous::count();
            $rdvConfirmes = RendezVous::where('statut', 'CONFIRME')->count();
            $rdvCompletes = RendezVous::where('statut', 'COMPLETE')->count();
            $rdvAbsents = RendezVous::where('statut', 'ABSENT')->count();
            $rdvManques = $totalRendezVous - $rdvCompletes - $rdvConfirmes;

            // SMS
            $totalSms = NotificationSms::count();
            $smsEnvoyes = NotificationSms::where('statut', 'ENVOYE')->count();
            $smsEchoues = NotificationSms::where('statut', 'ECHEC')->count();

            // Risques
            $scoresRisque = ScoreRisque::select('niveau_risque', DB::raw('COUNT(*) as count'))
                ->groupBy('niveau_risque')
                ->get();

            $repartitionRisque = [
                'ELEVE' => 0,
                'MOYEN' => 0,
                'BAS' => 0,
            ];

            foreach ($scoresRisque as $score) {
                $repartitionRisque[$score->niveau_risque] = $score->count;
            }

            // Enfants par statut vaccinal
            $enfantsParStatut = Enfant::select('statut_vaccinal_global', DB::raw('COUNT(*) as count'))
                ->groupBy('statut_vaccinal_global')
                ->get()
                ->keyBy('statut_vaccinal_global');

            // Performance des centres
            $centresPerformance = CentreSante::select('centres_sante.id', 'centres_sante.nom', DB::raw('COUNT(DISTINCT a.enfant_id) as enfants_vaccines'))
                ->leftJoin('actes_vaccinaux as a', 'centres_sante.id', '=', 'a.centre_sante_id')
                ->groupBy('centres_sante.id', 'centres_sante.nom')
                ->orderByDesc('enfants_vaccines')
                ->limit(5)
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'resume' => [
                        'total_enfants' => $totalEnfants,
                        'total_centres' => $totalCentres,
                        'total_agents' => $totalAgents,
                        'total_admins' => $totalAdmins,
                    ],
                    'vaccinations' => [
                        'total_actes' => $totalActesVaccinaux,
                        'enfants_vaccines' => $enfantsVaccines,
                        'taux_couverture' => round($tauxCouverture, 2),
                    ],
                    'rendez_vous' => [
                        'total' => $totalRendezVous,
                        'confirmes' => $rdvConfirmes,
                        'completes' => $rdvCompletes,
                        'absents' => $rdvAbsents,
                        'manques' => $rdvManques,
                    ],
                    'sms' => [
                        'total' => $totalSms,
                        'envoyes' => $smsEnvoyes,
                        'echoues' => $smsEchoues,
                    ],
                    'risques' => $repartitionRisque,
                    'statut_vaccinal' => $enfantsParStatut->toArray(),
                    'centres_top_performance' => $centresPerformance,
                    'timestamp' => now()->toISOString(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
