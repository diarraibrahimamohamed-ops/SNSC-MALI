<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeclarationSymptomePrenatal extends Model
{
    use HasUuids;

    protected $table = 'declarations_symptomes_prenataux';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'grossesse_id',
        'contact_prenatal_id',
        'centre_sante_id',
        'auteur_id',
        'code_symptome',
        'libelle_symptome',
        'statut_declaration',
        'source_declaration',
        'declare_le',
        'debut_estime_le',
        'intensite_declaree',
        'precision',
        'observations',
        'statut_validation',
    ];

    protected function casts(): array
    {
        return [
            'declare_le' => 'datetime',
            'debut_estime_le' => 'datetime',
            'intensite_declaree' => 'integer',
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
