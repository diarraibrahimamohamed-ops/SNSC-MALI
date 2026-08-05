<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRendezVousRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'nullable|uuid',
            'enfant_id' => 'required|uuid|exists:enfants,id',
            'dose_calendrier_enfant_id' => 'nullable|uuid|exists:doses_calendrier_enfant,id',
            'date_cible' => 'required|date|after_or_equal:today',
            'statut' => 'nullable|string|in:PLANIFIE,CONFIRME,ANNULE,REALISE,ABSENT',
            'nombre_rappels' => 'nullable|integer|min:0',
            'canal' => 'nullable|string|max:50',
            'raison_absence' => 'nullable|string|max:500',
            'reprogramme_depuis_id' => 'nullable|uuid|exists:rendez_vous,id',
        ];
    }
}
