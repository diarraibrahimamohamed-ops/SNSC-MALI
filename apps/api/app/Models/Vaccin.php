<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Auditable;

class Vaccin extends Model
{
    use HasFactory, HasUuids, Auditable;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id',
        'code',
        'nom',
        'maladie_cible',
        'est_actif',
    ];

    protected $casts = [
        'est_actif' => 'boolean',
    ];

    public function modelesCalendrier(): HasMany
    {
        return $this->hasMany(ModeleCalendrier::class, 'vaccin_id');
    }

    public function actesVaccinaux(): HasMany
    {
        return $this->hasMany(ActeVaccinal::class, 'vaccin_id');
    }
}
