<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MesureClinique extends Model
{
    use HasUuids;

    protected $table = 'mesures_cliniques';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['grossesse_id', 'type_mesure', 'valeur', 'unite', 'mesuree_le', 'methode', 'auteur_id', 'source_donnee', 'statut_validation'];
    protected function casts(): array { return ['mesuree_le' => 'datetime', 'valeur' => 'decimal:3']; }
    public function grossesse(): BelongsTo { return $this->belongsTo(Grossesse::class, 'grossesse_id'); }
}
