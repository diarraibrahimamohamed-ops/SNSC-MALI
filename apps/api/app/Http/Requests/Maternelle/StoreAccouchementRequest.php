<?php

namespace App\Http\Requests\Maternelle;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccouchementRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'accouchement_le' => ['required', 'date', 'before_or_equal:now'],
            'centre_sante_id' => ['nullable', 'uuid', 'exists:CentreSante,centreId'],
            'type_accouchement' => ['nullable', 'in:VOIE_BASSE,CESARIENNE,AUTRE,INCONNU'],
            'issue' => ['required', 'in:NAISSANCE_VIVANTE,MORT_NEE,INTERRUPTION,AUTRE'],
            'complications' => ['nullable', 'array'],
            'nouveau_ne_enfant_ids' => ['nullable', 'array', 'max:8'],
            'nouveau_ne_enfant_ids.*' => ['uuid', 'distinct', 'exists:DossierEnfant,enfantId'],
            'source_donnee' => ['nullable', 'string', 'max:100'],
        ];
    }
}
