<?php

namespace App\Modules\PlanVaccinal\Services;

use App\Models\ActeVaccinal;
use App\Models\CalendrierVaccinal;
use App\Models\DosePlanifie;
use App\Models\DossierEnfant;
use App\Models\Vaccin;
use App\Modules\PlanVaccinal\Data\PevMaliSchedule;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class CalendrierPevService
{
    public function __construct(
        private readonly ValidationDoseService $validationService
    ) {}

    /**
     * Génère les doses planifiées lors de la création d'un dossier enfant.
     */
    public function genererDosesPlanifiees(DossierEnfant $enfant, CalendrierVaccinal $calendrier): void
    {
        $naissance = Carbon::parse($enfant->dateNaissance)->startOfDay();

        foreach (PevMaliSchedule::allRules() as $code => $rule) {
            if ($rule['sex'] && strtoupper($enfant->sexe) !== $rule['sex']) {
                continue;
            }

            $vaccin = Vaccin::where('code', $code)->first();
            if (! $vaccin) {
                continue;
            }

            $datePrevue = $naissance->copy()->addDays($rule['min_age_days']);

            if ($rule['prior_code']) {
                $priorRule = PevMaliSchedule::ruleForCode($rule['prior_code']);
                if ($priorRule) {
                    $dateApresPrior = $naissance->copy()
                        ->addDays($priorRule['min_age_days'])
                        ->addDays($rule['min_interval_days_after_prior'] ?? 28);

                    if ($dateApresPrior->gt($datePrevue)) {
                        $datePrevue = $dateApresPrior;
                    }
                }
            }

            DosePlanifie::create([
                'doseId' => (string) Str::uuid(),
                'datePrevue' => $datePrevue,
                'dateAdministration' => null,
                'calendrierId' => $calendrier->calendrierId,
                'vaccinId' => $vaccin->vaccinId,
            ]);
        }
    }

    /**
     * Calendrier personnalisé pour un enfant (affichage agent).
     */
    public function calendrierPourEnfant(DossierEnfant $enfant, ?Carbon $referenceDate = null): Collection
    {
        $referenceDate = ($referenceDate ?? Carbon::today())->startOfDay();
        $naissance = Carbon::parse($enfant->dateNaissance)->startOfDay();
        $actes = ActeVaccinal::where('enfantId', $enfant->enfantId)->get()->keyBy('vaccinId');

        return Vaccin::all()
            ->filter(fn (Vaccin $v) => PevMaliSchedule::ruleForCode($v->code) !== null)
            ->sortBy(fn (Vaccin $v) => PevMaliSchedule::ruleForCode($v->code)['min_age_days'])
            ->map(function (Vaccin $vaccin) use ($enfant, $naissance, $referenceDate, $actes) {
                $rule = PevMaliSchedule::ruleForCode($vaccin->code);

                if ($rule['sex'] && strtoupper($enfant->sexe) !== $rule['sex']) {
                    return null;
                }

                $datePrevue = $naissance->copy()->addDays($rule['min_age_days']);

                if ($rule['prior_code']) {
                    $priorRule = PevMaliSchedule::ruleForCode($rule['prior_code']);
                    $priorVaccin = Vaccin::where('code', $rule['prior_code'])->first();
                    $priorActe = $priorVaccin ? $actes->get($priorVaccin->vaccinId) : null;

                    if ($priorActe) {
                        $dateApresPrior = Carbon::parse($priorActe->dateActe)
                            ->addDays($rule['min_interval_days_after_prior'] ?? 28);
                        if ($dateApresPrior->gt($datePrevue)) {
                            $datePrevue = $dateApresPrior;
                        }
                    } elseif ($priorRule) {
                        $dateApresPrior = $naissance->copy()
                            ->addDays($priorRule['min_age_days'])
                            ->addDays($rule['min_interval_days_after_prior'] ?? 28);
                        if ($dateApresPrior->gt($datePrevue)) {
                            $datePrevue = $dateApresPrior;
                        }
                    }
                }

                $acte = $actes->get($vaccin->vaccinId);
                $validation = $this->validationService->valider($enfant, $vaccin, $referenceDate);

                $statut = 'A_VENIR';
                if ($acte) {
                    $statut = 'ADMINISTRE';
                } elseif ($referenceDate->lt($datePrevue)) {
                    $statut = 'TROP_TOT';
                } elseif ($validation['eligible']) {
                    $statut = 'ELIGIBLE';
                } elseif ($referenceDate->gt($datePrevue)) {
                    $statut = 'EN_RETARD';
                }

                return [
                    'vaccin_id' => $vaccin->vaccinId,
                    'code' => $vaccin->code,
                    'nom' => $vaccin->libelle,
                    'periode' => $rule['label'],
                    'date_prevue' => $datePrevue->toDateString(),
                    'date_eligible' => $validation['date_eligible'] ?? $datePrevue->toDateString(),
                    'age_minimum_jours' => $rule['min_age_days'],
                    'age_minimum_semaines' => intdiv($rule['min_age_days'], 7),
                    'statut' => $statut,
                    'eligible' => $validation['eligible'],
                    'message' => $validation['message'],
                    'administre_le' => $acte?->dateActe,
                ];
            })
            ->filter()
            ->values();
    }

    /**
     * Vaccins éligibles à une date pour un enfant.
     */
    public function vaccinsEligibles(DossierEnfant $enfant, Carbon $date): array
    {
        return Vaccin::all()
            ->map(function (Vaccin $vaccin) use ($enfant, $date) {
                $rule = PevMaliSchedule::ruleForCode($vaccin->code);
                if (! $rule) {
                    return null;
                }

                $validation = $this->validationService->valider($enfant, $vaccin, $date);

                return [
                    'vaccin_id' => $vaccin->vaccinId,
                    'code' => $vaccin->code,
                    'nom' => $vaccin->libelle,
                    'eligible' => $validation['eligible'],
                    'message' => $validation['message'],
                    'date_eligible' => $validation['date_eligible'] ?? null,
                    'periode' => $rule['label'],
                ];
            })
            ->filter()
            ->values()
            ->all();
    }
}
