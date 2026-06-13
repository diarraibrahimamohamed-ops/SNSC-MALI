<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DossierEnfant extends Model
{
    protected $table = 'DossierEnfant';
    protected $primaryKey = 'enfantId';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'enfantId',
        'identifiantSanitaire',
        'dateNaissance',
        'sexe',
        'tuteurId',
        'centreId',
    ];

    public function tuteur()
    {
        return $this->belongsTo(Tuteur::class, 'tuteurId', 'tuteurId');
    }

    public function centreSante()
    {
        return $this->belongsTo(CentreSante::class, 'centreId', 'centreId');
    }

    public function calendrierVaccinal()
    {
        return $this->hasOne(CalendrierVaccinal::class, 'enfantId', 'enfantId');
    }

    public function actesVaccinaux()
    {
        return $this->hasMany(ActeVaccinal::class, 'enfantId', 'enfantId');
    }

    public function scoresRisque()
    {
        return $this->hasMany(ScoreRisqueVaccinal::class, 'enfantId', 'enfantId');
    }

    public function journauxAudit()
    {
        return $this->hasMany(JournalAudit::class, 'enfantId', 'enfantId');
    }

    public function rendezVous()
    {
        return $this->hasMany(RendezVousVaccinal::class, 'enfantId', 'enfantId');
    }
}
