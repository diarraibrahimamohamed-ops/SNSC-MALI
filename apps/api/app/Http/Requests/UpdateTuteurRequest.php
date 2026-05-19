<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTuteurRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('tuteur') ?? $this->route('id');

        return [
            'id' => 'sometimes|uuid|unique:tuteurs,id,' . $id,
            'nom_complet' => 'sometimes|required|string|max:255',
            'telephone' => 'sometimes|required|string|max:20',
            'adresse' => 'nullable|string|max:500',
            'consentement_donne' => 'sometimes|required|boolean',
            'cree_le' => 'nullable|date',
        ];
    }
}
