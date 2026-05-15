<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enfant;
use App\Models\ActeVaccinal;
use App\Models\Agent;
use App\Models\CentreSante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatistiqueController extends Controller
{
    public function dashboardAdmin()
    {
        return response()->json([
            'data' => [
                'total_enfants' => Enfant::count(),
                'taux_couverture' => 84.2, // Simulation ou calcul réel si possible
                'agents_actifs' => Agent::where('est_actif', true)->count(),
                'centres_sante' => CentreSante::count(),
                'vaccinations_recentes' => ActeVaccinal::where('cree_le', '>=', now()->subDays(30))->count(),
            ]
        ]);
    }

    public function dashboardAgent()
    {
        $agent = auth('api')->user();
        
        return response()->json([
            'data' => [
                'mes_enfants' => Enfant::where('centre_sante_id', $agent->centre_sante_id)->count(),
                'vaccinations_jour' => ActeVaccinal::where('agent_id', $agent->id)
                    ->whereDate('date_administration', now())
                    ->count(),
                'vaccinations_mois' => ActeVaccinal::where('agent_id', $agent->id)
                    ->where('cree_le', '>=', now()->startOfMonth())
                    ->count(),
                'alertes_retard' => Enfant::where('centre_sante_id', $agent->centre_sante_id)
                    ->where('statut_vaccinal_global', 'RETARD')
                    ->count(),
            ]
        ]);
    }
}
