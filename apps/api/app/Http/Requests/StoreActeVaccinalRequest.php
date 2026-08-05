<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreActeVaccinalRequest extends FormRequest
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
            'vaccin_id' => 'required|uuid|exists:vaccins,id',
            'dose_calendrier_enfant_id' => 'nullable|uuid|exists:doses_calendrier_enfant,id',
            'agent_id' => 'required|uuid|exists:agents,id',
            'centre_sante_id' => 'required|uuid|exists:centres_sante,id',
            'administre_le' => 'required|date',
            'numero_lot' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ];
    }
}
