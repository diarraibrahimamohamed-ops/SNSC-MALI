<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Enfant extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id',
        'identifiant_sanitaire',
        'tuteur_principal_id',
        'centre_sante_id',
        'nom',
        'prenom',
        'age_mois',
        'date_naissance',
        'sexe',
        'statut_vaccinal_global',
        'donnees_chiffrees',
        'cree_le',
    ];

    protected $casts = [
        'age_mois' => 'integer',
        'date_naissance' => 'date',
        'statut_vaccinal_global' => 'string',
        'donnees_chiffrees' => 'array',
        'cree_le' => 'datetime',
    ];

    public function tuteurPrincipal(): BelongsTo
    {
        return $this->belongsTo(Tuteur::class, 'tuteur_principal_id');
    }

    public function centreSante(): BelongsTo
    {
        return $this->belongsTo(CentreSante::class, 'centre_sante_id');
    }

    public function tuteurs(): BelongsToMany
    {
        return $this->belongsToMany(Tuteur::class, 'enfant_tuteurs', 'enfant_id', 'tuteur_id')
            ->withPivot('type_relation', 'est_principal');
    }

    public function dosesCalendrier(): HasMany
    {
        return $this->hasMany(DoseCalendrierEnfant::class, 'enfant_id');
    }

    public function actesVaccinaux(): HasMany
    {
        return $this->hasMany(ActeVaccinal::class, 'enfant_id');
    }

    public function rendezVous(): HasMany
    {
        return $this->hasMany(RendezVous::class, 'enfant_id');
    }

    public function scoresRisque(): HasMany
    {
        return $this->hasMany(ScoreRisque::class, 'enfant_id');
    }

    public function notificationsSms(): HasMany
    {
        return $this->hasMany(NotificationSms::class, 'enfant_id');
    }
}
