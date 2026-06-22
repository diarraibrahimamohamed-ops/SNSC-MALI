<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RendezVousVaccinal extends Model
{
    protected $table = 'RendezVousVaccinal';
    protected $primaryKey = 'rdvId';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'rdvId',
        'datePrevue',
        'dateRelancePrevue',
        'enfantId',
        'doseId',
    ];

    public function dossierEnfant()
    {
        return $this->belongsTo(DossierEnfant::class, 'enfantId', 'enfantId');
    }

    public function dosePlanifiee()
    {
        return $this->belongsTo(DosePlanifie::class, 'doseId', 'doseId');
    }

    public function notificationsSms()
    {
        return $this->hasMany(NotificationSMS::class, 'rdvId', 'rdvId');
    }
}
