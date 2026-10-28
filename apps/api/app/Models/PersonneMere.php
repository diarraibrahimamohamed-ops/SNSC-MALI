<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PersonneMere extends Model
{
    use HasUuids;

    protected $table = 'personnes_meres';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'identifiant_sanitaire', 'nom', 'prenom', 'date_naissance', 'telephone', 'langue_preferee',
        'centre_sante_id', 'source_donnee', 'collecte_le', 'auteur_id', 'statut', 'archive_le',
    ];

    protected function casts(): array
    {
        return ['date_naissance' => 'date', 'collecte_le' => 'datetime', 'archive_le' => 'datetime'];
    }

    public function centreSante(): BelongsTo { return $this->belongsTo(CentreSante::class, 'centre_sante_id', 'centreId'); }
    public function grossesses(): HasMany { return $this->hasMany(Grossesse::class, 'mere_id'); }
    public function liensEnfants(): HasMany { return $this->hasMany(LienMereEnfant::class, 'mere_id'); }
    public function suivisPostpartum(): HasMany { return $this->hasMany(SuiviPostPartum::class, 'mere_id'); }
}
