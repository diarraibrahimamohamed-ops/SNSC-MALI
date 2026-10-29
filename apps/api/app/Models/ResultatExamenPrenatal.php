<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResultatExamenPrenatal extends Model
{
    use HasUuids;

    protected $table = 'resultats_examens_prenataux';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'grossesse_id',
        'contact_prenatal_id',
        'centre_sante_id',
        'auteur_id',
        'code_examen',
        'nom_examen',
        'categorie',
        'statut_resultat',
        'resultat_texte',
        'resultat_numerique',
        'unite',
        'details',
        'date_prelevement',
        'date_resultat',
        'laboratoire',
        'source_donnee',
        'version_protocole',
        'statut_validation',
    ];

    protected function casts(): array
    {
        return [
            'resultat_numerique' => 'decimal:4',
            'details' => 'array',
            'date_prelevement' => 'datetime',
            'date_resultat' => 'datetime',
        ];
    }

    public function grossesse(): BelongsTo
    {
        return $this->belongsTo(Grossesse::class, 'grossesse_id');
    }

    public function contactPrenatal(): BelongsTo
    {
        return $this->belongsTo(ContactPrenatal::class, 'contact_prenatal_id');
    }

    public function centreSante(): BelongsTo
    {
        return $this->belongsTo(CentreSante::class, 'centre_sante_id', 'centreId');
    }
}
