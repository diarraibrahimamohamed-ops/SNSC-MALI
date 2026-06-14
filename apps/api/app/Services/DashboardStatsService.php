<?php

namespace App\Services;

use App\Models\ActeVaccinal;
use App\Models\AgentSante;
use App\Models\CentreSante;
use App\Models\DosePlanifie;
use App\Models\DossierEnfant;
use App\Models\NotificationSMS;
use App\Models\RendezVousVaccinal;
use App\Models\ScoreRisqueVaccinal;
use App\Models\Vaccin;
use App\Support\PdmApiMapper;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class DashboardStatsService
{
    public function getStats(?string $centreId = null): array
    {
        $enfantIds = $this->enfantIdsForScope($centreId);
        $todayStart = Carbon::today();
        $todayEnd = Carbon::tomorrow();

        $totalEnfants = $enfantIds->count();

        $vaccinationsAujourdhui = $enfantIds->isEmpty()
            ? 0
            : ActeVaccinal::whereIn('enfantId', $enfantIds)
                ->whereBetween('dateActe', [$todayStart, $todayEnd])
                ->count();

        $rendezVousAujourdhui = $enfantIds->isEmpty()
            ? 0
            : RendezVousVaccinal::whereIn('enfantId', $enfantIds)
                ->whereBetween('datePrevue', [$todayStart, $todayEnd])
                ->count();

        $relancesEnvoyees = $enfantIds->isEmpty()
            ? 0
            : NotificationSMS::whereDate('dateEnvoi', $todayStart)
                ->whereHas('rendezVous', fn ($q) => $q->whereIn('enfantId', $enfantIds))
                ->count();

        $enfantsVaccines = $enfantIds->isEmpty()
            ? 0
            : ActeVaccinal::whereIn('enfantId', $enfantIds)
                ->distinct()
                ->count('enfantId');

        $couverture = $totalEnfants > 0
            ? (int) round(($enfantsVaccines / $totalEnfants) * 100)
            : 0;

        $enfantsEnRetard = $this->countEnfantsEnRetard($enfantIds);

        $enfantsARisque = $enfantIds->isEmpty()
            ? 0
            : ScoreRisqueVaccinal::whereIn('enfantId', $enfantIds)
                ->where(function ($q) {
                    $q->whereIn('niveauCode', ['ELEVE', 'CRITIQUE', 'HAUT', 'ELEVÉ'])
                        ->orWhere('score', '>=', 70);
                })
                ->distinct()
                ->count('enfantId');

        $agentsQuery = AgentSante::query();
        if ($centreId) {
            $agentsQuery->where('centreId', $centreId);
        }

        return [
            'total_enfants' => $totalEnfants,
            'vaccinations_aujourd_hui' => $vaccinationsAujourdhui,
            'rendez_vous_aujourd_hui' => $rendezVousAujourdhui,
            'relances_envoyees' => $relancesEnvoyees,
            'enfants_a_risque' => $enfantsARisque,
            'couverture_vaccinale' => $couverture,
            'enfants_en_retard' => $enfantsEnRetard,
            'vaccins_disponibles' => Vaccin::count(),
            'total_agents' => $agentsQuery->count(),
            'total_centres' => CentreSante::count(),
            'activite_recente' => $this->getRecentActivity($enfantIds),
        ];
    }

    public function getRecentActivity(Collection $enfantIds, int $limit = 5): array
    {
        if ($enfantIds->isEmpty()) {
            return [
                'vaccinations' => [],
                'enfants' => [],
            ];
        }

        $vaccinations = ActeVaccinal::with(['dossierEnfant', 'vaccin', 'agentSante'])
            ->whereIn('enfantId', $enfantIds)
            ->orderByDesc('dateActe')
            ->limit($limit)
            ->get()
            ->map(function (ActeVaccinal $acte) {
                $enfant = $acte->dossierEnfant;

                return [
                    'id' => $acte->acteId,
                    'administre_le' => $acte->dateActe,
                    'vaccin' => $acte->vaccin?->libelle,
                    'enfant_nom' => $enfant ? trim(($enfant->nom ?? '') . ' ' . ($enfant->prenom ?? '')) : null,
                    'agent_nom' => $acte->agentSante?->nom,
                ];
            });

        $enfants = DossierEnfant::with(['actesVaccinaux', 'calendrierVaccinal.dosesPlanifiees'])
            ->whereIn('enfantId', $enfantIds)
            ->get()
            ->sortByDesc(fn (DossierEnfant $e) => $e->calendrierVaccinal?->dateCreation ?? $e->dateNaissance)
            ->take($limit)
            ->values()
            ->map(fn (DossierEnfant $e) => PdmApiMapper::enfant($e));

        return [
            'vaccinations' => $vaccinations,
            'enfants' => $enfants,
        ];
    }

    private function enfantIdsForScope(?string $centreId): Collection
    {
        $query = DossierEnfant::query();

        if ($centreId) {
            $query->where('centreId', $centreId);
        }

        return $query->pluck('enfantId');
    }

    private function countEnfantsEnRetard(Collection $enfantIds): int
    {
        if ($enfantIds->isEmpty()) {
            return 0;
        }

        return DosePlanifie::query()
            ->whereNull('dateAdministration')
            ->where('datePrevue', '<', Carbon::today())
            ->whereHas('calendrierVaccinal', fn ($q) => $q->whereIn('enfantId', $enfantIds))
            ->join('CalendrierVaccinal', 'DosePlanifie.calendrierId', '=', 'CalendrierVaccinal.calendrierId')
            ->distinct()
            ->count('CalendrierVaccinal.enfantId');
    }
}
