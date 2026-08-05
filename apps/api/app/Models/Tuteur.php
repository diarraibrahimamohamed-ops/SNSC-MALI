<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tuteur extends Model
{
    protected $table = 'Tuteur';
    protected $primaryKey = 'tuteurId';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'tuteurId',
        'nomComplet',
        'telephone',
    ];

    public function dossiersEnfants()
    {
        return $this->hasMany(DossierEnfant::class, 'tuteurId', 'tuteurId');
    }
}
