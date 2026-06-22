<?php

namespace App\Modules\RendezVous\Services;

use App\Models\DosePlanifie;
use App\Models\DossierEnfant;
use App\Models\RendezVousVaccinal;
use App\Modules\PlanVaccinal\Services\CalendrierPevService;
use Carbon\Carbon;
use Illuminate\Support\Str;

class RendezVousService
{
    public function __construct(
        private readonly CalendrierPevService $calendrierService
    ) {}

    /**
     * Marque la dose planifiée correspondant au vaccin administré.
     */
    public function marquerDoseAdministree(DossierEnfant $enfant, Carbon $dateAdmin, ?string $vaccinId = null): void
    {
        $calendrier = $enfant->calendrierVaccinal;
        if (! $calendrier) {
            return;
        }

        $query = DosePlanifie::where('calendrierId', $calendrier->calendrierId)
            ->whereNull('dateAdministration');

        if ($vaccinId) {
            $query->where('vaccinId', $vaccinId);
        }

        $dose = $query->orderBy('datePrevue')->first();

        // Doses anciennes sans vaccinId : marquer la première dose en attente
        if (! $dose && $vaccinId) {
            $dose = DosePlanifie::where('calendrierId', $calendrier->calendrierId)
                ->whereNull('dateAdministration')
                ->orderBy('datePrevue')
                ->first();
        }

        if ($dose) {
            $updates = ['dateAdministration' => $dateAdmin];
            if ($vaccinId && empty($dose->vaccinId)) {
                $updates['vaccinId'] = $vaccinId;
            }
            $dose->update($updates);
        }
    }

    /**
     * Recalcule le prochain rendez-vous vaccinal après une administration.
     */
    public function recalculerProchainRendezVous(DossierEnfant $enfant): ?RendezVousVaccinal
    {
        $calendrier = $enfant->calendrierVaccinal;
        if (! $calendrier) {
            return null;
        }

        $prochaineDose = DosePlanifie::where('calendrierId', $calendrier->calendrierId)
            ->whereNull('dateAdministration')
            ->orderBy('datePrevue')
            ->first();

        if (! $prochaineDose) {
            RendezVousVaccinal::where('enfantId', $enfant->enfantId)
                ->where('datePrevue', '>=', now())
                ->delete();

            return null;
        }

        $datePrevue = Carbon::parse($prochaineDose->datePrevue);

        $rdv = RendezVousVaccinal::where('enfantId', $enfant->enfantId)
            ->where('doseId', $prochaineDose->doseId)
            ->first();

        if ($rdv) {
            $rdv->update([
                'datePrevue' => $datePrevue,
                'dateRelancePrevue' => $datePrevue->copy()->subDays(config('sms.relance_delai_jours', 3)),
            ]);

            return $rdv;
        }

        return RendezVousVaccinal::create([
            'rdvId' => (string) Str::uuid(),
            'datePrevue' => $datePrevue,
            'dateRelancePrevue' => $datePrevue->copy()->subDays(config('sms.relance_delai_jours', 3)),
            'enfantId' => $enfant->enfantId,
            'doseId' => $prochaineDose->doseId,
        ]);
    }

    /**
     * Retourne la prochaine échéance vaccinale pour un enfant.
     */
    public function prochaineEcheance(DossierEnfant $enfant): ?array
    {
        $calendrier = $this->calendrierService->calendrierPourEnfant($enfant);

        $prochain = $calendrier
            ->filter(fn ($d) => in_array($d['statut'], ['ELIGIBLE', 'EN_RETARD', 'A_VENIR'], true))
            ->sortBy('date_prevue')
            ->first();

        if (! $prochain) {
            return null;
        }

        return [
            'vaccin' => $prochain['nom'],
            'code' => $prochain['code'],
            'date_prevue' => $prochain['date_prevue'],
            'statut' => $prochain['statut'],
        ];
    }
}
