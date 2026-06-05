<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Auditable;

class ActeVaccinal extends Model
{
    use HasFactory, HasUuids, Auditable;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;
    protected $table = 'actes_vaccinaux';

    protected $fillable = [
        'id',
        'enfant_id',
        'vaccin_id',
        'dose_calendrier_enfant_id',
        'agent_id',
        'centre_sante_id',
        'administre_le',
        'numero_lot',
        'notes',
        'cree_le',
    ];

    protected $casts = [
        'administre_le' => 'datetime',
        'cree_le' => 'datetime',
    ];

    public function enfant(): BelongsTo
    {
        return $this->belongsTo(Enfant::class, 'enfant_id');
    }

    public function vaccin(): BelongsTo
    {
        return $this->belongsTo(Vaccin::class, 'vaccin_id');
    }

    public function doseCalendrierEnfant(): BelongsTo
    {
        return $this->belongsTo(DoseCalendrierEnfant::class, 'dose_calendrier_enfant_id');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'agent_id');
    }

    public function centreSante(): BelongsTo
    {
        return $this->belongsTo(CentreSante::class, 'centre_sante_id');
    }
}
