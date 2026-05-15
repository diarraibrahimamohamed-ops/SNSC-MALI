<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVaccinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'nullable|uuid',
            'code' => 'required|string|unique:vaccins,code',
            'nom' => 'required|string|max:255',
            'maladie_cible' => 'nullable|string|max:255',
            'est_actif' => 'nullable|boolean',
        ];
    }
}
