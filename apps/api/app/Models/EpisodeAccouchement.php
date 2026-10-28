<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EpisodeAccouchement extends Model
{
    use HasUuids;

    protected $table = 'episodes_accouchement';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['grossesse_id', 'accouchement_le', 'centre_sante_id', 'type_accouchement', 'issue', 'complications', 'auteur_id', 'source_donnee', 'statut_validation'];
    protected function casts(): array { return ['accouchement_le' => 'datetime', 'complications' => 'array']; }
    public function grossesse(): BelongsTo { return $this->belongsTo(Grossesse::class, 'grossesse_id'); }
}
