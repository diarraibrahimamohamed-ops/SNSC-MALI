<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Agent extends Authenticatable implements JWTSubject
{
    use Notifiable, HasRoles, HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id',
        'centre_sante_id',
        'nom_complet',
        'matricule',
        'password',
        'role',
        'telephone',
        'est_actif',
        'cree_le',
    ];

    protected $casts = [
        'est_actif' => 'boolean',
        'cree_le' => 'datetime',
        'password' => 'hashed',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function getJWTIdentifier()
    {
        return $this->id;
    }

    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
            'centre_sante_id' => $this->centre_sante_id,
        ];
    }

    public function centreSante(): BelongsTo
    {
        return $this->belongsTo(CentreSante::class, 'centre_sante_id');
    }

    public function actesVaccinaux(): HasMany
    {
        return $this->hasMany(ActeVaccinal::class, 'agent_id');
    }

    public function journauxAudit(): HasMany
    {
        return $this->hasMany(JournalAudit::class, 'agent_id');
    }
}
