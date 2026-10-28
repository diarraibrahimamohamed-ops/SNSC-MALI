<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuiviPostPartum extends Model
{
    use HasUuids;

    protected $table = 'suivis_postpartum';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['mere_id', 'accouchement_id', 'suivi_le', 'type_contact', 'observations', 'orientation', 'prochain_rendez_vous_le', 'centre_sante_id', 'auteur_id', 'source_donnee', 'statut_validation'];
    protected function casts(): array { return ['suivi_le' => 'datetime', 'prochain_rendez_vous_le' => 'date', 'observations' => 'array']; }
    public function mere(): BelongsTo { return $this->belongsTo(PersonneMere::class, 'mere_id'); }
    public function accouchement(): BelongsTo { return $this->belongsTo(EpisodeAccouchement::class, 'accouchement_id'); }
}
