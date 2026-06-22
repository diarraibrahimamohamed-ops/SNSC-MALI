<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatutVaccinal extends Model
{
    protected $table = 'StatutVaccinal';
    protected $primaryKey = 'code';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'code',
        'libelle',
    ];
}
