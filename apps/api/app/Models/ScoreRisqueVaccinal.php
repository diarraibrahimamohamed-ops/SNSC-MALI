<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScoreRisqueVaccinal extends Model
{
    protected $table = 'ScoreRisqueVaccinal';
    protected $primaryKey = 'scoreId';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'scoreId',
        'score',
        'confiance',
        'versionModele',
        'dateCalcul',
        'enfantId',
        'niveauCode',
    ];

    public function dossierEnfant()
    {
        return $this->belongsTo(DossierEnfant::class, 'enfantId', 'enfantId');
    }

    public function niveauRisque()
    {
        return $this->belongsTo(NiveauRisque::class, 'niveauCode', 'code');
    }
}
