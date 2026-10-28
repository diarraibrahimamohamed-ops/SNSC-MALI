<?php

namespace App\Http\Requests\Maternelle;

use Illuminate\Foundation\Http\FormRequest;

class StoreMereRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'identifiant_sanitaire' => ['nullable', 'string', 'max:100', 'unique:personnes_meres,identifiant_sanitaire'],
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['nullable', 'string', 'max:100'],
            'date_naissance' => ['nullable', 'date', 'before:today'],
            'telephone' => ['nullable', 'string', 'max:30'],
            'langue_preferee' => ['nullable', 'string', 'max:20'],
            'centre_sante_id' => ['nullable', 'uuid', 'exists:CentreSante,centreId'],
            'source_donnee' => ['nullable', 'string', 'max:100'],
        ];
    }
}
