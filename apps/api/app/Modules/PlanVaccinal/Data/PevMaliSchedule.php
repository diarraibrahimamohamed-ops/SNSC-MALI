<?php

namespace App\Modules\PlanVaccinal\Data;

/**
 * Calendrier PEV Mali — âges minimums et intervalles entre doses.
 * Aligné sur apps/web/src/constants/vaccins.ts
 */
class PevMaliSchedule
{
    public const RULES = [
        'BCG' => [
            'min_age_days' => 0,
            'label' => 'Dès la naissance',
            'prior_code' => null,
            'min_interval_days_after_prior' => null,
            'sex' => null,
        ],
        'PENTA_1' => [
            'min_age_days' => 42,
            'label' => "Dès l'âge de 6 semaines",
            'prior_code' => null,
            'min_interval_days_after_prior' => null,
            'sex' => null,
        ],
        'VPO_1' => [
            'min_age_days' => 42,
            'label' => "Dès l'âge de 6 semaines",
            'prior_code' => null,
            'min_interval_days_after_prior' => null,
            'sex' => null,
        ],
        'PENTA_2' => [
            'min_age_days' => 70,
            'label' => 'À partir de 10 semaines (1 mois après Penta1)',
            'prior_code' => 'PENTA_1',
            'min_interval_days_after_prior' => 28,
            'sex' => null,
        ],
        'VPO_2' => [
            'min_age_days' => 70,
            'label' => 'À partir de 10 semaines (1 mois après VPO1)',
            'prior_code' => 'VPO_1',
            'min_interval_days_after_prior' => 28,
            'sex' => null,
        ],
        'PENTA_3' => [
            'min_age_days' => 98,
            'label' => 'À partir de 14 semaines (1 mois après Penta2)',
            'prior_code' => 'PENTA_2',
            'min_interval_days_after_prior' => 28,
            'sex' => null,
        ],
        'VPO_3' => [
            'min_age_days' => 98,
            'label' => 'À partir de 14 semaines (1 mois après VPO2)',
            'prior_code' => 'VPO_2',
            'min_interval_days_after_prior' => 28,
            'sex' => null,
        ],
        'VPI' => [
            'min_age_days' => 98,
            'label' => 'À partir de la 14ème semaine',
            'prior_code' => null,
            'min_interval_days_after_prior' => null,
            'sex' => null,
        ],
        'VIT_A' => [
            'min_age_days' => 180,
            'label' => 'À partir de 6 mois',
            'prior_code' => null,
            'min_interval_days_after_prior' => null,
            'sex' => null,
        ],
        'VAR' => [
            'min_age_days' => 270,
            'label' => 'À partir de 9 mois',
            'prior_code' => null,
            'min_interval_days_after_prior' => null,
            'sex' => null,
        ],
        'VAA' => [
            'min_age_days' => 270,
            'label' => 'À partir de 9 mois',
            'prior_code' => null,
            'min_interval_days_after_prior' => null,
            'sex' => null,
        ],
        'MEN_A' => [
            'min_age_days' => 270,
            'label' => 'À partir de 9 mois',
            'prior_code' => null,
            'min_interval_days_after_prior' => null,
            'sex' => null,
        ],
        'HPV' => [
            'min_age_days' => 3285,
            'label' => '9 à 13 ans (filles uniquement)',
            'prior_code' => null,
            'min_interval_days_after_prior' => null,
            'sex' => 'F',
        ],
    ];

    public static function ruleForCode(?string $code): ?array
    {
        if (! $code || ! isset(self::RULES[$code])) {
            return null;
        }

        return self::RULES[$code];
    }

    public static function allRules(): array
    {
        return self::RULES;
    }
}
