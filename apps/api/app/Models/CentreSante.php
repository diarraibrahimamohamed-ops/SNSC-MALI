<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CentreSante extends Model
{
    protected $table = 'CentreSante';
    protected $primaryKey = 'centreId';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'centreId',
        'nom',
        'zoneSanitaire',
    ];

    public function dossiersEnfants()
    {
        return $this->hasMany(DossierEnfant::class, 'centreId', 'centreId');
    }

    public function agents()
    {
        return $this->hasMany(AgentSante::class, 'centreId', 'centreId');
    }
}
