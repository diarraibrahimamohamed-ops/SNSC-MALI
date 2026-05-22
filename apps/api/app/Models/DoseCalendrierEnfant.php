<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Auditable;

class DoseCalendrierEnfant extends Model
{
    use HasFactory, HasUuids, Auditable;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;
    protected $table = 'doses_calendrier_enfant';

    protected $fillable = [
        'id',
        'enfant_id',
        'modele_calendrier_id',
        'statut',
        'date_echeance',
        'debut_fenetre',
        'fin_fenetre',
        'administree_le',
        'retard_detecte_le',
    ];

    protected $casts = [
        'date_echeance' => 'date',
        'debut_fenetre' => 'date',
        'fin_fenetre' => 'date',
        'administree_le' => 'datetime',
        'retard_detecte_le' => 'datetime',
    ];

    public function enfant(): BelongsTo
    {
        return $this->belongsTo(Enfant::class, 'enfant_id');
    }

    public function modeleCalendrier(): BelongsTo
    {
        return $this->belongsTo(ModeleCalendrier::class, 'modele_calendrier_id');
    }

    public function actesVaccinaux(): HasMany
    {
        return $this->hasMany(ActeVaccinal::class, 'dose_calendrier_enfant_id');
    }

    public function rendezVous(): HasMany
    {
        return $this->hasMany(RendezVous::class, 'dose_calendrier_enfant_id');
    }
}
