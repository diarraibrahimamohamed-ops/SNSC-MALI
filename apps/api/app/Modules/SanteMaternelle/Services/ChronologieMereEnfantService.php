<?php

namespace App\Modules\SanteMaternelle\Services;

use App\Models\PersonneMere;
use Illuminate\Support\Collection;

class ChronologieMereEnfantService
{
    /**
     * Assemble des faits sourcés; une valeur inconnue est laissée absente plutôt qu'inférée.
     */
    public function pour(PersonneMere $mere): Collection
    {
        $mere->loadMissing([
            'grossesses.contacts',
            'grossesses.symptomes',
            'grossesses.rendezVousPrenataux',
            'grossesses.accouchement',
            'antecedentsObstetricaux',
            'liensEnfants.enfant.actesVaccinaux.vaccin',
            'suivisPostpartum',
        ]);

        $faits = collect();

        foreach ($mere->grossesses as $grossesse) {
            $faits->push([
                'type' => 'GROSSESSE',
                'date' => $grossesse->created_at?->toIso8601String(),
                'id' => $grossesse->id,
                'statut' => $grossesse->statut,
                'provenance' => $grossesse->source_donnee,
                'validation' => $grossesse->statut_validation,
            ]);

            foreach ($grossesse->contacts as $contact) {
                $faits->push([
                    'type' => 'CONTACT_PRENATAL',
                    'date' => $contact->contact_le?->toIso8601String(),
                    'id' => $contact->id,
                    'statut' => $contact->statut_validation,
                    'provenance' => $contact->source_donnee,
                    'prochaine_etape' => $contact->prochaine_etape,
                    'prochain_rendez_vous_le' => $contact->prochain_rendez_vous_le?->toDateString(),
                ]);
            }

            foreach ($grossesse->rendezVousPrenataux as $rendezVous) {
                $faits->push([
                    'type' => 'RENDEZ_VOUS_PRENATAL',
                    'date' => $rendezVous->prevu_le?->toDateString(),
                    'id' => $rendezVous->id,
                    'statut' => $rendezVous->statut,
                    'provenance' => 'CALENDRIER_PRENATAL',
                    'libelle' => $rendezVous->libelle,
                    'rendez_vous_type' => $rendezVous->type_rendez_vous,
                    'rappel_statut' => $rendezVous->rappel_statut,
                ]);
            }

            foreach ($grossesse->symptomes as $symptome) {
                $faits->push([
                    'type' => 'SYMPTOME_PRENATAL_DECLARE',
                    'date' => $symptome->declare_le?->toIso8601String(),
                    'id' => $symptome->id,
                    'statut' => $symptome->statut_declaration,
                    'provenance' => $symptome->source_declaration,
                    'libelle' => $symptome->libelle_symptome,
                    'validation' => $symptome->statut_validation,
                ]);
            }

            if ($grossesse->accouchement) {
                $faits->push([
                    'type' => 'ACCOUCHEMENT',
                    'date' => $grossesse->accouchement->accouchement_le?->toIso8601String(),
                    'id' => $grossesse->accouchement->id,
                    'statut' => $grossesse->accouchement->statut_validation,
                    'provenance' => $grossesse->accouchement->source_donnee,
                    'issue' => $grossesse->accouchement->issue,
                ]);
            }
        }

        foreach ($mere->antecedentsObstetricaux as $antecedent) {
            $faits->push([
                'type' => 'ANTECEDENT_OBSTETRICAL',
                'date' => $antecedent->date_evenement?->toDateString() ?? $antecedent->created_at?->toIso8601String(),
                'id' => $antecedent->id,
                'statut' => $antecedent->statut_validation,
                'provenance' => $antecedent->source_declaration,
                'libelle' => $antecedent->precision ?: $antecedent->code_antecedent,
            ]);
        }

        foreach ($mere->suivisPostpartum as $suivi) {
            $faits->push([
                'type' => 'SUIVI_POSTPARTUM',
                'date' => $suivi->suivi_le?->toIso8601String(),
                'id' => $suivi->id,
                'statut' => $suivi->statut_validation,
                'provenance' => $suivi->source_donnee,
                'orientation' => $suivi->orientation,
            ]);
        }

        foreach ($mere->liensEnfants as $lien) {
            $faits->push([
                'type' => 'LIEN_MERE_ENFANT',
                'date' => $lien->created_at?->toIso8601String(),
                'id' => $lien->id,
                'statut' => $lien->statut_verification,
                'provenance' => $lien->source_donnee,
                'enfant_id' => $lien->enfant_id,
            ]);

            foreach ($lien->enfant?->actesVaccinaux ?? [] as $acte) {
                $faits->push([
                    'type' => 'VACCINATION_ENFANT',
                    'date' => $acte->dateActe?->toIso8601String(),
                    'id' => $acte->acteId,
                    'vaccin' => $acte->vaccin?->code,
                    'enfant_id' => $lien->enfant_id,
                    'provenance' => 'DOSSIER_VACCINAL',
                ]);
            }
        }

        return $faits->filter(fn (array $fait) => $fait['date'] !== null)->sortBy('date')->values();
    }
}
