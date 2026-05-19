<?php

namespace App\Modules\RisqueIA\Services;

use App\Models\DoseCalendrierEnfant;
use App\Models\Enfant;
use App\Models\ScoreRisque;
use Illuminate\Support\Str;

class RisqueService
{
    public function __construct(private readonly PythonIAClient $pythonIAClient)
    {
    }

    public function evaluer(Enfant $enfant): ScoreRisque
    {
        $result = null;

        if ((bool) config('ia.enabled', true)) {
            try {
                $result = $this->pythonIAClient->evaluate($this->buildPayload($enfant));
            } catch (\Throwable $e) {
                if (!(bool) config('ia.fallback_local', true)) {
                    throw $e;
                }
            }
        }

        if (!$result) {
            $result = $this->fallbackEvaluate($enfant);
        }

        return ScoreRisque::updateOrCreate(
            ['enfant_id' => $enfant->id],
            [
                'id' => (string) Str::uuid(),
                'version_modele' => $result['version_modele'] ?? 'fallback-v1',
                'score' => (int) round(($result['risque_score'] ?? 0) * 100),
                'niveau_risque' => $result['niveau_risque'] ?? 'FAIBLE',
                'confiance' => (float) ($result['confidence'] ?? 0.5),
                'facteurs_explicatifs' => $result['explications'] ?? ($result['facteurs_explicatifs'] ?? []),
                'calcule_le' => now(),
            ]
        );
    }

    private function buildPayload(Enfant $enfant): array
    {
        $dosesRetard = DoseCalendrierEnfant::where('enfant_id', $enfant->id)
            ->where('date_echeance', '<', now())
            ->where('statut', '!=', 'ADMINISTREE')
            ->count();

        return [
            'enfant_id' => $enfant->id,
            'age_en_mois' => $enfant->age_mois,
            'vaccinations' => $enfant->actesVaccinaux()->count(),
            'caracteristiques' => [
                'sexe' => $enfant->sexe,
                'doses_retard' => $dosesRetard,
            ],
            'timestamp' => now()->toISOString(),
        ];
    }

    private function fallbackEvaluate(Enfant $enfant): array
    {
        $dosesRetard = DoseCalendrierEnfant::where('enfant_id', $enfant->id)
            ->where('date_echeance', '<', now())
            ->where('statut', '!=', 'ADMINISTREE')
            ->count();

        $score = min(1, $dosesRetard * 0.2);

        return [
            'risque_score' => $score,
            'niveau_risque' => $score >= 0.6 ? 'ELEVÉ' : ($score > 0 ? 'MODÉRÉ' : 'FAIBLE'),
            'confidence' => 0.7,
            'facteurs_explicatifs' => ['doses_retard' => $dosesRetard],
            'version_modele' => 'fallback-v1',
        ];
    }
}
