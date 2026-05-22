<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats(Request $request)
    {
        try {
            $totalEnfants = DB::table('enfants')->count();
            $vaccinationsAujourdhui = DB::table('actes_vaccinaux')
                ->whereDate('administre_le', now()->toDateString())
                ->count();
            $rendezVousAujourdhui = DB::table('rendez_vous')
                ->whereDate('date_cible', now()->toDateString())
                ->where('statut', 'PROGRAMME')
                ->count();
            $relancesEnvoyees = DB::table('notifications_sms')
                ->whereDate('envoye_le', now()->toDateString())
                ->where('statut_livraison', 'ENVOYE')
                ->count();
            $enfantsARisque = DB::table('scores_risque')
                ->where('niveau_risque', 'ELEVE')
                ->count();
                
            // Calculer la couverture vaccinale (simplifié : % d'enfants ayant au moins un acte vaccinal)
            $enfantsVaccines = DB::table('actes_vaccinaux')->distinct('enfant_id')->count();
            $couvertureVaccinale = $totalEnfants > 0 ? round(($enfantsVaccines / $totalEnfants) * 100, 1) : 0;

            $stats = [
                'total_enfants' => $totalEnfants,
                'vaccinations_aujourd_hui' => $vaccinationsAujourdhui,
                'rendez_vous_aujourd_hui' => $rendezVousAujourdhui,
                'relances_envoyees' => $relancesEnvoyees,
                'enfants_a_risque' => $enfantsARisque,
                'couverture_vaccinale' => $couvertureVaccinale,
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
