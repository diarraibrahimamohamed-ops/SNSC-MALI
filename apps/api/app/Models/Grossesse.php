<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Grossesse extends Model
{
    use HasUuids;

    protected $table = 'grossesses';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'mere_id', 'date_debut_estimee', 'terme_estime', 'nombre_foetus', 'statut', 'centre_sante_id',
        'version_protocole', 'source_donnee', 'date_source', 'auteur_id', 'statut_validation', 'archive_le',
    ];

    protected function casts(): array
    {
        return ['date_debut_estimee' => 'date', 'terme_estime' => 'date', 'date_source' => 'datetime', 'archive_le' => 'datetime'];
    }

    public function mere(): BelongsTo { return $this->belongsTo(PersonneMere::class, 'mere_id'); }
    public function centreSante(): BelongsTo { return $this->belongsTo(CentreSante::class, 'centre_sante_id', 'centreId'); }
    public function contacts(): HasMany { return $this->hasMany(ContactPrenatal::class, 'grossesse_id'); }
    public function mesures(): HasMany { return $this->hasMany(MesureClinique::class, 'grossesse_id'); }
    public function rendezVousPrenataux(): HasMany { return $this->hasMany(RendezVousPrenatal::class, 'grossesse_id'); }
    public function symptomes(): HasMany { return $this->hasMany(DeclarationSymptomePrenatal::class, 'grossesse_id'); }
    public function accouchement(): HasOne { return $this->hasOne(EpisodeAccouchement::class, 'grossesse_id'); }
}
