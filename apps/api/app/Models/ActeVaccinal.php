<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActeVaccinal extends Model
{
    protected $table = 'ActeVaccinal';
    protected $primaryKey = 'acteId';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'acteId',
        'dateActe',
        'lotVaccin',
        'enfantId',
        'vaccinId',
        'statutCode',
        'agentId',
    ];

    public function dossierEnfant()
    {
        return $this->belongsTo(DossierEnfant::class, 'enfantId', 'enfantId');
    }

    public function vaccin()
    {
        return $this->belongsTo(Vaccin::class, 'vaccinId', 'vaccinId');
    }

    public function agentSante()
    {
        return $this->belongsTo(AgentSante::class, 'agentId', 'agentId');
    }

    public function statut()
    {
        return $this->belongsTo(StatutVaccinal::class, 'statutCode', 'code');
    }
}
