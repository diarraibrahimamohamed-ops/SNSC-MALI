<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class AgentSante extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $table = 'AgentSante';
    protected $primaryKey = 'agentId';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'agentId',
        'nom',
        'matricule',
        'password',
        'centreId',
        'role'
    ];

    protected $hidden = [
        'password',
    ];

    public function centreSante()
    {
        return $this->belongsTo(CentreSante::class, 'centreId', 'centreId');
    }

    public function actesVaccinaux()
    {
        return $this->hasMany(ActeVaccinal::class, 'agentId', 'agentId');
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}
