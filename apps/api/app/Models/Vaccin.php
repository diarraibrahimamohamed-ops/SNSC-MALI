<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vaccin extends Model
{
    protected $table = 'Vaccin';
    protected $primaryKey = 'vaccinId';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'vaccinId',
        'libelle',
        'code',
    ];

    public function actesVaccinaux()
    {
        return $this->hasMany(ActeVaccinal::class, 'vaccinId', 'vaccinId');
    }
}
