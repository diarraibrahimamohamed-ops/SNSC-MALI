<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AntecedentObstetrical extends Model
{
    use HasUuids;

    protected $table = 'antecedents_obstetricaux';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'mere_id',
        'centre_sante_id',
        'auteur_id',
        'code_antecedent',
        'date_evenement',
        'source_declaration',
        'precision',
        'observations',
        'statut_validation',
    ];

    protected function casts(): array
    {
        return ['date_evenement' => 'date'];
    }

    public function mere(): BelongsTo
    {
        return $this->belongsTo(PersonneMere::class, 'mere_id');
    }

    public function centreSante(): BelongsTo
    {
        return $this->belongsTo(CentreSante::class, 'centre_sante_id', 'centreId');
    }
}
