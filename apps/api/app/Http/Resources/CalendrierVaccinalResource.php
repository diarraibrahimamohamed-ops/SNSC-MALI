<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CalendrierVaccinalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'statut' => $this->statut,
            'date_echeance' => $this->date_echeance,
            'debut_fenetre' => $this->debut_fenetre,
            'fin_fenetre' => $this->fin_fenetre,
            'administree_le' => $this->administree_le,
            'retard_detecte_le' => $this->retard_detecte_le,
            'enfant' => $this->whenLoaded('enfant'),
            'modele_calendrier' => $this->whenLoaded('modeleCalendrier'),
        ];
    }
}
