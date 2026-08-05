<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NiveauRisque extends Model
{
    protected $table = 'NiveauRisque';
    protected $primaryKey = 'code';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'code',
        'libelle',
    ];

    public function scores()
    {
        return $this->hasMany(ScoreRisqueVaccinal::class, 'niveauCode', 'code');
    }
}
