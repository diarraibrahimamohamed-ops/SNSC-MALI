<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationSMS extends Model
{
    protected $table = 'NotificationSMS';
    protected $primaryKey = 'notificationId';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'notificationId',
        'dateEnvoi',
        'statutLivraison',
        'rdvId',
    ];

    public function rendezVous()
    {
        return $this->belongsTo(RendezVousVaccinal::class, 'rdvId', 'rdvId');
    }
}
