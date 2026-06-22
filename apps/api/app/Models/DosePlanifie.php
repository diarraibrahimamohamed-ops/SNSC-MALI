<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DosePlanifie extends Model
{
    protected $table = 'DosePlanifie';
    protected $primaryKey = 'doseId';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'doseId',
        'datePrevue',
        'dateAdministration',
        'calendrierId',
        'vaccinId',
    ];

    public function calendrierVaccinal()
    {
        return $this->belongsTo(CalendrierVaccinal::class, 'calendrierId', 'calendrierId');
    }

    public function vaccin()
    {
        return $this->belongsTo(Vaccin::class, 'vaccinId', 'vaccinId');
    }

    public function rendezVous()
    {
        return $this->hasMany(RendezVousVaccinal::class, 'doseId', 'doseId');
    }
}
