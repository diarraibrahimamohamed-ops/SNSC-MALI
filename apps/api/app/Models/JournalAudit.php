<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalAudit extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;
    protected $table = 'journaux_audit';

    protected $fillable = [
        'id',
        'agent_id',
        'action',
        'type_cible',
        'id_cible',
        'resultat',
        'metadonnees',
        'date_evenement',
    ];

    protected $casts = [
        'metadonnees' => 'array',
        'date_evenement' => 'datetime',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'agent_id');
    }
}
