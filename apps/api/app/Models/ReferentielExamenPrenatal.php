<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ReferentielExamenPrenatal extends Model
{
    use HasUuids;

    protected $table = 'referentiels_examens_prenataux';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'version_protocole',
        'code_examen',
        'nom_examen',
        'categorie',
        'modalite',
        'semaine_min',
        'semaine_max',
        'source_reference',
        'auteur_id',
    ];

    protected function casts(): array
    {
        return [
            'semaine_min' => 'integer',
            'semaine_max' => 'integer',
        ];
    }
}
