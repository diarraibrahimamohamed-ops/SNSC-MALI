<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Auditable;

class CentreSante extends Model
{
    use HasFactory, HasUuids, Auditable;

    protected $table = 'centres_sante';

    protected $primaryKey = 'id';

    public $incrementing = false;
    public $timestamps = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'nom',
        'code_zone',
        'adresse',
        'capacite',
        'region',
        'ville',
        'cree_le',
    ];

    protected $casts = [
        'capacite' => 'integer',
        'cree_le' => 'datetime',
    ];

    public function enfants(): HasMany
    {
        return $this->hasMany(Enfant::class, 'centre_sante_id');
    }

    public function agents(): HasMany
    {
        return $this->hasMany(Agent::class, 'centre_sante_id');
    }

    public function actesVaccinaux(): HasMany
    {
        return $this->hasMany(ActeVaccinal::class, 'centre_sante_id');
    }
}
