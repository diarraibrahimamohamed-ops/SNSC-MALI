<?php

namespace App\Http\Requests\Maternelle;

use Illuminate\Foundation\Http\FormRequest;

class StoreGrossesseRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'date_debut_estimee' => ['required', 'date', 'before_or_equal:today'],
            'terme_estime' => ['nullable', 'date', 'after_or_equal:date_debut_estimee'],
            'nombre_foetus' => ['nullable', 'integer', 'min:1', 'max:8'],
            'centre_sante_id' => ['nullable', 'uuid', 'exists:CentreSante,centreId'],
            'version_protocole' => ['nullable', 'string', 'max:100'],
            'source_donnee' => ['nullable', 'string', 'max:100'],
            'date_source' => ['nullable', 'date'],
        ];
    }
}
