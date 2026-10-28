<?php

namespace App\Http\Requests\Maternelle;

use Illuminate\Foundation\Http\FormRequest;

class StoreSuiviPostpartumRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'accouchement_id' => ['nullable', 'uuid', 'exists:episodes_accouchement,id'],
            'suivi_le' => ['required', 'date', 'before_or_equal:now'],
            'type_contact' => ['required', 'in:POSTPARTUM_VISITE,POSTPARTUM_APPEL,AUTRE'],
            'observations' => ['nullable', 'array'],
            'orientation' => ['nullable', 'string', 'max:255'],
            'prochain_rendez_vous_le' => ['nullable', 'date'],
            'source_donnee' => ['nullable', 'string', 'max:100'],
        ];
    }
}
