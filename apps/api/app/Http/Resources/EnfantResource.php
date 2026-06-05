<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnfantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'identifiant_sanitaire' => $this->identifiant_sanitaire,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'age_mois' => $this->age_mois,
            'date_naissance' => $this->date_naissance,
            'sexe' => $this->sexe,
            'statut_vaccinal_global' => $this->statut_vaccinal_global,
            'donnees_chiffrees' => $this->donnees_chiffrees,
            'cree_le' => $this->cree_le,
            'tuteur_principal' => $this->whenLoaded('tuteurPrincipal'),
            'centre_sante' => $this->whenLoaded('centreSante'),
            'tuteurs' => TuteurResource::collection($this->whenLoaded('tuteurs')),
            'doses_calendrier' => $this->whenLoaded('dosesCalendrier'),
            'actes_vaccinaux' => $this->whenLoaded('actesVaccinaux'),
            'rendez_vous' => $this->whenLoaded('rendezVous'),
        ];
    }
}
