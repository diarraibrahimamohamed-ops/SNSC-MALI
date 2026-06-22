<?php

namespace App\Modules\RisqueIA\Services;

use App\Models\ActeVaccinal;
use App\Models\DosePlanifie;
use App\Models\DossierEnfant;
use App\Models\RendezVousVaccinal;
use Carbon\Carbon;

class CollecteurFeaturesService
{
    /**
     * Collecte les caractéristiques pour le modèle de risque d'abandon.
     */
    public function collecterFeatures(string $enfantId): array
    {
        $enfant = DossierEnfant::with(['centreSante', 'calendrierVaccinal.dosesPlanifiees', 'actesVaccinaux'])
            ->where('enfantId', $enfantId)
            ->firstOrFail();

        $naissance = Carbon::parse($enfant->dateNaissance)->startOfDay();
        $maintenant = now()->startOfDay();

        $actes = ActeVaccinal::where('enfantId', $enfantId)
            ->orderByDesc('dateActe')
            ->get();

        $retardsJours = $this->calculerRetardsJours($enfant);
        $rdvManques = $this->compterRendezVousManques($enfantId);

        return [
            'retards_jours' => $retardsJours,
            'rendez_vous_manques' => $rdvManques,
            'distance_km' => 10,
            'age_en_mois' => (int) $naissance->diffInMonths($maintenant),
            'nombre_vaccinations' => $actes->count(),
            'jours_derniere_vaccination' => $actes->first()
                ? (int) Carbon::parse($actes->first()->dateActe)->diffInDays($maintenant)
                : null,
            'zone_sanitaire' => $enfant->centreSante?->zoneSanitaire,
        ];
    }

    public function donneesEssentiellesCompletes(DossierEnfant $enfant): bool
    {
        if (! $enfant->dateNaissance) {
            return false;
        }

        return true;
    }

    public function calculerScoreSecours(DossierEnfant $enfant): array
    {
        $retardsJours = $this->calculerRetardsJours($enfant);

        $score = min(max(round($retardsJours * 0.05, 2), 0.0), 1.0);
        $niveau = match (true) {
            $retardsJours > 14 => 'ELEVE',
            $retardsJours > 0 => 'MOYEN',
            default => 'FAIBLE',
        };

        return [
            'score' => $score,
            'niveau_risque' => $niveau,
            'confiance' => 0.5,
            'version_modele' => 'v1.0-fallback-retard',
            'facteurs_explicatifs' => [
                'mode' => 'secours',
                'retards_jours' => $retardsJours,
            ],
        ];
    }

    private function calculerRetardsJours(DossierEnfant $enfant): int
    {
        $calendrier = $enfant->calendrierVaccinal;
        if (! $calendrier) {
            return 0;
        }

        $doses = $calendrier->relationLoaded('dosesPlanifiees')
            ? $calendrier->dosesPlanifiees
            : $calendrier->dosesPlanifiees()->get();

        $maxRetard = 0;
        foreach ($doses as $dose) {
            if ($dose->dateAdministration !== null) {
                continue;
            }
            $datePrevue = Carbon::parse($dose->datePrevue)->startOfDay();
            if ($datePrevue->lt(now())) {
                $retard = (int) $datePrevue->diffInDays(now());
                $maxRetard = max($maxRetard, $retard);
            }
        }

        return $maxRetard;
    }

    private function compterRendezVousManques(string $enfantId): int
    {
        return RendezVousVaccinal::where('enfantId', $enfantId)
            ->where('datePrevue', '<', now())
            ->whereDoesntHave('notificationsSms', fn ($q) => $q->where('statutLivraison', 'ENVOYE'))
            ->count();
    }
}
