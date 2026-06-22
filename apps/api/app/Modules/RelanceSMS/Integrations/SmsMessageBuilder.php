<?php

namespace App\Modules\RelanceSMS\Integrations;

use App\Models\DossierEnfant;
use App\Models\RendezVousVaccinal;
use App\Models\Vaccin;
use Carbon\Carbon;

class SmsMessageBuilder
{
    public function construire(RendezVousVaccinal $rdv, string $niveauRisque): string
    {
        $enfant = $rdv->dossierEnfant;
        $tuteur = $enfant?->tuteur;
        $centre = $enfant?->centreSante;

        $templateFile = match (strtoupper($niveauRisque)) {
            'ELEVE' => 'relance_eleve.txt',
            'MOYEN' => 'relance_moyen.txt',
            default => 'relance_faible.txt',
        };

        $templatePath = base_path('../../data/sms-templates/' . $templateFile);
        if (! file_exists($templatePath)) {
            $templatePath = database_path('../data/sms-templates/' . $templateFile);
        }
        if (! file_exists($templatePath)) {
            $templatePath = '/home/empereur/Bureau/vaccin-track/data/sms-templates/' . $templateFile;
        }

        $template = file_exists($templatePath)
            ? file_get_contents($templatePath)
            : 'Rappel vaccinal pour {enfant_nom}. RDV le {date_rendez_vous} au {centre_sante_nom}.';

        $datePrevue = Carbon::parse($rdv->datePrevue);
        $naissance = $enfant ? Carbon::parse($enfant->dateNaissance) : now();
        $ageMois = (int) $naissance->diffInMonths(now());

        $vaccinNom = $this->nomVaccinPourDose($rdv);

        $replacements = [
            '{enfant_nom}' => trim(($enfant?->prenom ?? '') . ' ' . ($enfant?->nom ?? 'votre enfant')),
            '{tuteur_nom}' => $tuteur?->nomComplet ?? 'parent',
            '{age_mois}' => (string) $ageMois,
            '{date_rendez_vous}' => $datePrevue->format('d/m/Y'),
            '{heure_rendez_vous}' => $datePrevue->format('H:i'),
            '{centre_sante_nom}' => $centre?->nom ?? 'centre de santé',
            '{adresse_centre}' => $centre?->zoneSanitaire ?? '',
            '{telephone_centre}' => '',
            '{vaccin_nom}' => $vaccinNom,
        ];

        $message = str_replace(array_keys($replacements), array_values($replacements), $template);

        if (strlen($message) > 1550) {
            $message = mb_substr($message, 0, 1530) . '...';
        }

        return $message;
    }

    private function nomVaccinPourDose(RendezVousVaccinal $rdv): string
    {
        $dose = $rdv->dosePlanifiee;
        if (! $dose) {
            return 'vaccination PEV';
        }

        $enfant = $rdv->dossierEnfant;
        if (! $enfant) {
            return 'vaccination PEV';
        }

        $calendrier = app(\App\Modules\PlanVaccinal\Services\CalendrierPevService::class)
            ->calendrierPourEnfant($enfant);

        $prochain = $calendrier
            ->filter(fn ($d) => $d['date_prevue'] === Carbon::parse($dose->datePrevue)->toDateString())
            ->first();

        return $prochain['nom'] ?? 'vaccination PEV';
    }
}
