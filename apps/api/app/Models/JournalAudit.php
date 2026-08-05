<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalAudit extends Model
{
    protected $table = 'JournalAudit';
    protected $primaryKey = 'auditId';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'auditId',
        'action',
        'horodatage',
        'enfantId',
    ];

    public function dossierEnfant()
    {
        return $this->belongsTo(DossierEnfant::class, 'enfantId', 'enfantId');
    }
}
