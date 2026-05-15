<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScoreRisque extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;
    protected $table = 'scores_risque';

    protected $fillable = [
        'id',
        'enfant_id',
        'rendez_vous_id',
        'version_modele',
        'score',
        'niveau_risque',
        'confiance',
        'facteurs_explicatifs',
        'calcule_le',
    ];

    protected $casts = [
        'score' => 'decimal:4',
        'confiance' => 'decimal:4',
        'facteurs_explicatifs' => 'array',
        'calcule_le' => 'datetime',
    ];

    public function enfant(): BelongsTo
    {
        return $this->belongsTo(Enfant::class, 'enfant_id');
    }

    public function rendezVous(): BelongsTo
    {
        return $this->belongsTo(RendezVous::class, 'rendez_vous_id');
    }

    public function notificationsSms(): HasMany
    {
        return $this->hasMany(NotificationSms::class, 'score_risque_id');
    }
}
