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
            $stats = [
                'total_enfants' => DB::table('enfants')->count(),
                'vaccinations_aujourd_hui' => DB::table('actes_vaccinaux')
                    ->whereDate('date_vaccination', now()->toDateString())
                    ->count(),
                'rendez_vous_aujourd_hui' => DB::table('rendez_vous')
                    ->whereDate('date_rendez_vous', now()->toDateString())
                    ->where('statut', 'planifié')
                    ->count(),
                'relances_envoyees' => DB::table('notifications_sms')
                    ->whereDate('created_at', now()->toDateString())
                    ->where('statut', 'envoyé')
                    ->count(),
                'enfants_a_risque' => DB::table('scores_risque')
                    ->where('niveau', 'élevé')
                    ->count(),
                'couverture_vaccinale' => 85.5, // Placeholder - would be calculated based on actual data
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
