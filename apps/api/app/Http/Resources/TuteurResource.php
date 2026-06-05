<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TuteurResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom_complet' => $this->nom_complet,
            'telephone' => $this->telephone,
            'adresse' => $this->adresse,
            'consentement_donne' => $this->consentement_donne,
            'cree_le' => $this->cree_le,
            'enfants' => $this->whenLoaded('enfants'),
        ];
    }
}
