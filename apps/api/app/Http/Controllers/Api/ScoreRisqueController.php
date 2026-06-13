<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ScoreRisqueVaccinal;
use Illuminate\Support\Facades\Http;
use App\Models\NiveauRisque;

class ScoreRisqueController extends Controller
{
    public function evaluer(Request $request)
    {
        $data = $request->validate([
            'enfant_id' => 'required|string',
            'features' => 'required|array'
        ]);

        try {
            // Appeler le microservice IA (Python)
            $iaUrl = env('IA_SERVICE_URL', 'http://127.0.0.1:8000');
            $response = Http::post("{$iaUrl}/predict", [
                'enfant_id' => $data['enfant_id'],
                'features' => $data['features']
            ]);

            if ($response->successful()) {
                $prediction = $response->json();
                
                // Ensure NiveauRisque exists (FAIBLE, MOYEN, ELEVE)
                if (!NiveauRisque::find($prediction['niveau_risque'])) {
                    NiveauRisque::create(['code' => $prediction['niveau_risque'], 'libelle' => ucfirst(strtolower($prediction['niveau_risque']))]);
                }

                $score = ScoreRisqueVaccinal::create([
                    'scoreId' => (string) \Str::uuid(),
                    'score' => $prediction['score'],
                    'confiance' => $prediction['confiance'],
                    'versionModele' => $prediction['version_modele'],
                    'dateCalcul' => now(),
                    'enfantId' => $data['enfant_id'],
                    'niveauCode' => $prediction['niveau_risque']
                ]);

                return response()->json([
                    'data' => $score, 
                    'explications' => $prediction['facteurs_explicatifs'] ?? null
                ], 201);
            }

            return response()->json(['message' => 'Erreur lors de l\'évaluation par l\'IA'], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Service IA indisponible', 'error' => $e->getMessage()], 503);
        }
    }
}
