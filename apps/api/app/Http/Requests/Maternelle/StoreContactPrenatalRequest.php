<?php

namespace App\Http\Requests\Maternelle;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactPrenatalRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'contact_le' => ['required', 'date', 'before_or_equal:now'],
            'type_contact' => ['required', 'in:CPN,VISITE_DOMICILE,TELECONSULTATION,AUTRE'],
            'age_gestationnel_semaines' => ['nullable', 'integer', 'min:0', 'max:45'],
            'observations' => ['nullable', 'array'],
            'prochaine_etape' => ['nullable', 'string', 'max:255'],
            'prochain_rendez_vous_le' => ['nullable', 'date'],
            'version_protocole' => ['nullable', 'string', 'max:100'],
            'source_donnee' => ['nullable', 'string', 'max:100'],
        ];
    }
}
