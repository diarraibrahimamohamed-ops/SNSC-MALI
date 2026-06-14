<?php

namespace App\Modules\PlanVaccinal\Services;

use App\Models\ActeVaccinal;
use App\Models\DossierEnfant;
use App\Models\Vaccin;
use App\Modules\PlanVaccinal\Data\PevMaliSchedule;
use Carbon\Carbon;

class ValidationDoseService
{
    /**
     * Valide si un vaccin peut être administré à un enfant à une date donnée.
     *
     * @return array{eligible: bool, message: string, date_eligible?: string, age_jours?: int, age_minimum_jours?: int, code?: string}
     */
    public function valider(DossierEnfant $enfant, Vaccin $vaccin, Carbon $dateAdmin): array
    {
        $rule = PevMaliSchedule::ruleForCode($vaccin->code);

        if (! $rule) {
            return [
                'eligible' => false,
                'message' => "Vaccin « {$vaccin->libelle} » non reconnu dans le calendrier PEV Mali.",
                'code' => $vaccin->code,
            ];
        }

        if ($rule['sex'] && strtoupper($enfant->sexe) !== $rule['sex']) {
            return [
                'eligible' => false,
                'message' => "Le vaccin {$vaccin->libelle} est réservé aux {$this->sexeLabel($rule['sex'])}.",
                'code' => $vaccin->code,
            ];
        }

        $dejaAdministre = ActeVaccinal::where('enfantId', $enfant->enfantId)
            ->where('vaccinId', $vaccin->vaccinId)
            ->exists();

        if ($dejaAdministre) {
            return [
                'eligible' => false,
                'message' => "Ce vaccin ({$vaccin->libelle}) a déjà été administré à cet enfant.",
                'code' => $vaccin->code,
            ];
        }

        $naissance = Carbon::parse($enfant->dateNaissance)->startOfDay();
        $dateAdmin = $dateAdmin->copy()->startOfDay();

        if ($dateAdmin->lt($naissance)) {
            return [
                'eligible' => false,
                'message' => 'La date de vaccination ne peut pas être antérieure à la date de naissance.',
                'code' => $vaccin->code,
            ];
        }

        $ageJours = (int) $naissance->diffInDays($dateAdmin);
        $dateEligible = $naissance->copy();

        if ($ageJours < $rule['min_age_days']) {
            $dateEligible->addDays($rule['min_age_days']);

            return [
                'eligible' => false,
                'message' => "Trop tôt : {$vaccin->libelle} est prévu {$rule['label']}. "
                    . "L'enfant n'a que {$this->formaterAge($ageJours)} à cette date. "
                    . "Éligible à partir du {$dateEligible->format('d/m/Y')}.",
                'date_eligible' => $dateEligible->toDateString(),
                'age_jours' => $ageJours,
                'age_minimum_jours' => $rule['min_age_days'],
                'code' => $vaccin->code,
            ];
        }

        if ($rule['prior_code']) {
            $priorVaccin = Vaccin::where('code', $rule['prior_code'])->first();

            if (! $priorVaccin) {
                return [
                    'eligible' => false,
                    'message' => "La dose précédente ({$rule['prior_code']}) doit d'abord être administrée.",
                    'code' => $vaccin->code,
                ];
            }

            $priorActe = ActeVaccinal::where('enfantId', $enfant->enfantId)
                ->where('vaccinId', $priorVaccin->vaccinId)
                ->orderByDesc('dateActe')
                ->first();

            if (! $priorActe) {
                return [
                    'eligible' => false,
                    'message' => "La dose {$rule['prior_code']} doit être administrée avant {$vaccin->libelle}.",
                    'code' => $vaccin->code,
                ];
            }

            $datePrior = Carbon::parse($priorActe->dateActe)->startOfDay();
            $joursDepuisPrior = (int) $datePrior->diffInDays($dateAdmin);
            $intervalMin = $rule['min_interval_days_after_prior'] ?? 28;
            $dateEligibleApresPrior = $datePrior->copy()->addDays($intervalMin);

            if ($joursDepuisPrior < $intervalMin) {
                return [
                    'eligible' => false,
                    'message' => "Intervalle insuffisant : {$vaccin->libelle} requiert au moins {$intervalMin} jours après {$rule['prior_code']}. "
                        . "Éligible à partir du {$dateEligibleApresPrior->format('d/m/Y')}.",
                    'date_eligible' => $dateEligibleApresPrior->toDateString(),
                    'age_jours' => $ageJours,
                    'code' => $vaccin->code,
                ];
            }

            if ($dateAdmin->lt($dateEligibleApresPrior)) {
                return [
                    'eligible' => false,
                    'message' => "Éligible à partir du {$dateEligibleApresPrior->format('d/m/Y')} (intervalle après {$rule['prior_code']}).",
                    'date_eligible' => $dateEligibleApresPrior->toDateString(),
                    'code' => $vaccin->code,
                ];
            }
        }

        return [
            'eligible' => true,
            'message' => 'Vaccination conforme au calendrier PEV.',
            'age_jours' => $ageJours,
            'age_minimum_jours' => $rule['min_age_days'],
            'code' => $vaccin->code,
        ];
    }

    private function formaterAge(int $jours): string
    {
        if ($jours === 0) {
            return '0 jour (naissance)';
        }
        if ($jours < 7) {
            return "{$jours} jour" . ($jours > 1 ? 's' : '');
        }
        if ($jours < 30) {
            $semaines = intdiv($jours, 7);
            $reste = $jours % 7;

            return $reste > 0
                ? "{$semaines} semaine" . ($semaines > 1 ? 's' : '') . " et {$reste} jour" . ($reste > 1 ? 's' : '')
                : "{$semaines} semaine" . ($semaines > 1 ? 's' : '');
        }
        if ($jours < 365) {
            $mois = intdiv($jours, 30);

            return "environ {$mois} mois";
        }

        $ans = intdiv($jours, 365);

        return "{$ans} an" . ($ans > 1 ? 's' : '');
    }

    private function sexeLabel(string $sexe): string
    {
        return match (strtoupper($sexe)) {
            'F' => 'filles',
            'M' => 'garçons',
            default => 'enfants du sexe indiqué',
        };
    }
}
