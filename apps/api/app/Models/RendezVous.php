<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RendezVous extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;
    protected $table = 'rendez_vous';

    protected $fillable = [
        'id',
        'enfant_id',
        'dose_calendrier_enfant_id',
        'date_cible',
        'statut',
        'nombre_rappels',
        'canal',
        'raison_absence',
        'reprogramme_depuis_id',
        'cree_le',
    ];

    protected $casts = [
        'date_cible' => 'date',
        'cree_le' => 'datetime',
        'nombre_rappels' => 'integer',
    ];

    public function enfant(): BelongsTo
    {
        return $this->belongsTo(Enfant::class, 'enfant_id');
    }

    public function doseCalendrierEnfant(): BelongsTo
    {
        return $this->belongsTo(DoseCalendrierEnfant::class, 'dose_calendrier_enfant_id');
    }

    public function reprogammedDepuis(): BelongsTo
    {
        return $this->belongsTo(RendezVous::class, 'reprogramme_depuis_id');
    }

    public function scoresRisque(): HasMany
    {
        return $this->hasMany(ScoreRisque::class, 'rendez_vous_id');
    }

    public function notificationsSms(): HasMany
    {
        return $this->hasMany(NotificationSms::class, 'rendez_vous_id');
    }
}
