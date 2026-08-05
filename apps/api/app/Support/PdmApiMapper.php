<?php

namespace App\Support;

use App\Models\ActeVaccinal;
use App\Models\AgentSante;
use App\Models\CentreSante;
use App\Models\DossierEnfant;
use App\Models\Tuteur;
use App\Models\Vaccin;

class PdmApiMapper
{
    public static function centre(CentreSante $centre): array
    {
        return [
            'id' => $centre->centreId,
            'centreId' => $centre->centreId,
            'nom' => $centre->nom,
            'region' => $centre->zoneSanitaire,
            'zoneSanitaire' => $centre->zoneSanitaire,
        ];
    }

    public static function agent(AgentSante $agent): array
    {
        $centre = $agent->relationLoaded('centreSante') ? $agent->centreSante : null;

        return [
            'id' => $agent->agentId,
            'agentId' => $agent->agentId,
            'nom' => $agent->nom,
            'nom_complet' => $agent->nom,
            'matricule' => $agent->matricule,
            'role' => $agent->role,
            'centre_sante_id' => $agent->centreId,
            'centreId' => $agent->centreId,
            'centre_sante' => $centre ? self::centre($centre) : null,
        ];
    }

    public static function tuteur(Tuteur $tuteur): array
    {
        return [
            'id' => $tuteur->tuteurId,
            'tuteurId' => $tuteur->tuteurId,
            'nom_complet' => $tuteur->nomComplet,
            'telephone' => $tuteur->telephone,
        ];
    }

    public static function enfant(DossierEnfant $enfant): array
    {
        return [
            'id' => $enfant->enfantId,
            'enfantId' => $enfant->enfantId,
            'nom' => $enfant->nom ?? 'Enfant',
            'prenom' => $enfant->prenom ?? ('N° ' . substr($enfant->enfantId, 0, 8)),
            'identifiant_sanitaire' => $enfant->identifiantSanitaire,
            'date_naissance' => $enfant->dateNaissance,
            'sexe' => $enfant->sexe,
            'tuteur_principal_id' => $enfant->tuteurId,
            'centre_sante_id' => $enfant->centreId,
            'statut_vaccinal_global' => self::computeStatutVaccinal($enfant),
        ];
    }

    public static function computeStatutVaccinal(DossierEnfant $enfant): string
    {
        $actesCount = $enfant->relationLoaded('actesVaccinaux')
            ? $enfant->actesVaccinaux->count()
            : $enfant->actesVaccinaux()->count();

        if ($actesCount === 0) {
            return 'INCONNU';
        }

        $calendrier = $enfant->relationLoaded('calendrierVaccinal')
            ? $enfant->calendrierVaccinal
            : $enfant->calendrierVaccinal()->with('dosesPlanifiees')->first();

        if ($calendrier) {
            $doses = $calendrier->relationLoaded('dosesPlanifiees')
                ? $calendrier->dosesPlanifiees
                : $calendrier->dosesPlanifiees()->get();

            $hasRetard = $doses->contains(
                fn ($dose) => $dose->dateAdministration === null
                    && $dose->datePrevue !== null
                    && $dose->datePrevue < now()
            );

            if ($hasRetard) {
                return 'RETARD';
            }

            $hasPending = $doses->contains(fn ($dose) => $dose->dateAdministration === null);

            if ($hasPending) {
                return 'INCOMPLET';
            }
        }

        return 'A_JOUR';
    }

    public static function vaccin(Vaccin $vaccin): array
    {
        return [
            'id' => $vaccin->vaccinId,
            'vaccinId' => $vaccin->vaccinId,
            'nom' => $vaccin->libelle,
            'libelle' => $vaccin->libelle,
            'code' => $vaccin->code,
        ];
    }

    public static function acte(ActeVaccinal $acte): array
    {
        return [
            'id' => $acte->acteId,
            'acteId' => $acte->acteId,
            'enfant_id' => $acte->enfantId,
            'vaccin_id' => $acte->vaccinId,
            'agent_id' => $acte->agentId,
            'administre_le' => $acte->dateActe,
            'numero_lot' => $acte->lotVaccin,
            'statut_code' => $acte->statutCode,
        ];
    }
}
