<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Auditable;

class NotificationSms extends Model
{
    use HasFactory, HasUuids, Auditable;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;
    protected $table = 'notifications_sms';

    protected $fillable = [
        'id',
        'rendez_vous_id',
        'enfant_id',
        'tuteur_id',
        'score_risque_id',
        'numero_telephone',
        'contenu_message',
        'statut_livraison',
        'envoye_le',
        'id_message_fournisseur',
    ];

    protected $casts = [
        'envoye_le' => 'datetime',
    ];

    public function rendezVous(): BelongsTo
    {
        return $this->belongsTo(RendezVous::class, 'rendez_vous_id');
    }

    public function enfant(): BelongsTo
    {
        return $this->belongsTo(Enfant::class, 'enfant_id');
    }

    public function tuteur(): BelongsTo
    {
        return $this->belongsTo(Tuteur::class, 'tuteur_id');
    }

    public function scoreRisque(): BelongsTo
    {
        return $this->belongsTo(ScoreRisque::class, 'score_risque_id');
    }
}
