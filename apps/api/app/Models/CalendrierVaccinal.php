<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CalendrierVaccinal extends Model
{
    protected $table = 'CalendrierVaccinal';
    protected $primaryKey = 'calendrierId';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'calendrierId',
        'dateCreation',
        'enfantId',
    ];

    public function dossierEnfant()
    {
        return $this->belongsTo(DossierEnfant::class, 'enfantId', 'enfantId');
    }

    public function dosesPlanifiees()
    {
        return $this->hasMany(DosePlanifie::class, 'calendrierId', 'calendrierId');
    }
}
