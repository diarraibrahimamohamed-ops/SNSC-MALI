<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationSmsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'telephone' => $this->numero_telephone,
            'message' => $this->contenu_message,
            'statut' => $this->statut_livraison,
            'date_envoi' => $this->envoye_le,
            'id_message_fournisseur' => $this->id_message_fournisseur,
            'enfant' => new EnfantResource($this->whenLoaded('enfant')),
            'tuteur' => $this->whenLoaded('tuteur'),
            'rendez_vous' => $this->whenLoaded('rendezVous'),
            'score_risque' => $this->whenLoaded('scoreRisque'),
        ];
    }
}
