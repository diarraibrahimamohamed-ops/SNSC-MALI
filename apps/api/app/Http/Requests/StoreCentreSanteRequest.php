<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCentreSanteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'nullable|uuid',
            'nom' => 'required|string|max:255',
            'code_zone' => 'nullable|string|max:100',
            'adresse' => 'nullable|string|max:500',
            'capacite' => 'nullable|integer|min:1',
        ];
    }
}
