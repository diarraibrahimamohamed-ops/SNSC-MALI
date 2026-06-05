<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActeVaccinalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'administre_le' => $this->administre_le,
            'numero_lot' => $this->numero_lot,
            'notes' => $this->notes,
            'cree_le' => $this->cree_le,
            'enfant' => $this->whenLoaded('enfant'),
            'vaccin' => $this->whenLoaded('vaccin'),
            'agent' => $this->whenLoaded('agent'),
            'centre_sante' => $this->whenLoaded('centreSante'),
            'dose_calendrier_enfant' => $this->whenLoaded('doseCalendrierEnfant'),
        ];
    }
}
