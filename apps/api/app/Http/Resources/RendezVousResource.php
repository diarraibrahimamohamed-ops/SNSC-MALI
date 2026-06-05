<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RendezVousResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date_cible' => $this->date_cible,
            'statut' => $this->statut,
            'nombre_rappels' => $this->nombre_rappels,
            'canal' => $this->canal,
            'raison_absence' => $this->raison_absence,
            'cree_le' => $this->cree_le,
            'enfant' => $this->whenLoaded('enfant'),
            'dose_calendrier_enfant' => $this->whenLoaded('doseCalendrierEnfant'),
            'reprogramme_depuis' => $this->whenLoaded('reprogrammeDepuis'),
        ];
    }
}
