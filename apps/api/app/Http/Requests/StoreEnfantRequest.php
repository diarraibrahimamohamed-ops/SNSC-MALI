<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEnfantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identifiant_sanitaire' => 'required|string|unique:enfants,identifiant_sanitaire',
            'tuteur_principal_id' => 'nullable|uuid|exists:tuteurs,id',
            'centre_sante_id' => 'required|uuid|exists:centres_sante,id',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'age_mois' => 'nullable|integer|min:0|max:216',
            'date_naissance' => 'required|date|before:today',
            'sexe' => 'required|string|in:M,F,Autre',
            'statut_vaccinal_global' => 'nullable|string|in:INCONNU,A_JOUR,RETARD,INCOMPLET',
            'donnees_chiffrees' => 'nullable|array',
            'tuteurs' => 'nullable|array',
            'tuteurs.*.tuteur_id' => 'required_with:tuteurs|uuid|exists:tuteurs,id',
            'tuteurs.*.type_relation' => 'nullable|string|max:255',
            'tuteurs.*.est_principal' => 'nullable|boolean',
        ];
    }
}
