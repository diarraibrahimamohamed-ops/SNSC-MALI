<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DossierEnfant;
use App\Models\ScoreRisqueVaccinal;
use Illuminate\Support\Facades\Http;
use App\Models\NiveauRisque;
use App\Modules\Audit\Services\AuditService;
use App\Modules\RisqueIA\Services\CollecteurFeaturesService;

class ScoreRisqueController extends Controller
{
    public function evaluer(
        Request $request,
        CollecteurFeaturesService $collecteur,
        AuditService $auditService
    ) {
        $data = $request->validate([
            'enfant_id' => 'required|string|exists:DossierEnfant,enfantId',
            'features' => 'nullable|array',
        ]);

        $enfant = DossierEnfant::where('enfantId', $data['enfant_id'])->firstOrFail();

        if (! $collecteur->donneesEssentiellesCompletes($enfant)) {
            $score = ScoreRisqueVaccinal::create([
                'scoreId' => (string) \Str::uuid(),
                'score' => 0,
                'confiance' => 0,
                'versionModele' => 'N/A',
                'dateCalcul' => now(),
                'enfantId' => $data['enfant_id'],
                'niveauCode' => 'INCONNU',
            ]);

            NiveauRisque::firstOrCreate(
                ['code' => 'INCONNU'],
                ['libelle' => 'Évaluation impossible : données incomplètes']
            );

            $auditService->journaliser(
                'RISQUE_IA: évaluation impossible — données incomplètes',
                $data['enfant_id']
            );

            return response()->json([
                'data' => $score,
                'etat' => 'évaluation impossible : données incomplètes',
            ], 422);
        }

        $features = $data['features'] ?? $collecteur->collecterFeatures($data['enfant_id']);

        try {
            $iaUrl = env('IA_SERVICE_URL', 'http://127.0.0.1:8000');
            $response = Http::timeout(10)->post("{$iaUrl}/predict", [
                'enfant_id' => $data['enfant_id'],
                'features' => $features,
            ]);

            if ($response->successful()) {
                return $this->persisterScore($data['enfant_id'], $response->json());
            }

            throw new \RuntimeException('Service IA a retourné une erreur: ' . $response->status());
        } catch (\Exception $e) {
            $auditService->journaliser(
                'RISQUE_IA_ECHEC: ' . $e->getMessage() . ' — utilisation règle de secours',
                $data['enfant_id']
            );

            $prediction = $collecteur->calculerScoreSecours($enfant);

            return $this->persisterScore($data['enfant_id'], $prediction, fallback: true);
        }
    }

    private function persisterScore(string $enfantId, array $prediction, bool $fallback = false)
    {
        $niveauCode = $prediction['niveau_risque'];

        NiveauRisque::firstOrCreate(
            ['code' => $niveauCode],
            ['libelle' => ucfirst(strtolower($niveauCode))]
        );

        $score = ScoreRisqueVaccinal::create([
            'scoreId' => (string) \Str::uuid(),
            'score' => $prediction['score'],
            'confiance' => $prediction['confiance'],
            'versionModele' => $prediction['version_modele'],
            'dateCalcul' => now(),
            'enfantId' => $enfantId,
            'niveauCode' => $niveauCode,
        ]);

        $response = [
            'data' => $score,
            'explications' => $prediction['facteurs_explicatifs'] ?? null,
        ];

        if ($fallback) {
            $response['mode'] = 'secours';
            $response['message'] = 'Service IA indisponible — score calculé par règle de secours (retard de jours).';
        }

        return response()->json($response, 201);
    }
}
