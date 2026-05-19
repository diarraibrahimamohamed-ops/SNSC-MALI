<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTuteurRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'nullable|uuid|unique:tuteurs,id',
            'nom_complet' => 'required|string|max:255',
            'telephone' => 'required|string|max:20',
            'adresse' => 'nullable|string|max:500',
            'consentement_donne' => 'required|boolean',
            'cree_le' => 'nullable|date',
        ];
    }
}
