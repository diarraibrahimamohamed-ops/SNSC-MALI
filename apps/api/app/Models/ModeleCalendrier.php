<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Auditable;

class ModeleCalendrier extends Model
{
    use HasFactory, HasUuids, Auditable;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;
    protected $table = 'modeles_calendrier';

    protected $fillable = [
        'id',
        'vaccin_id',
        'numero_dose',
        'age_min_jours',
        'age_recommandee_jours',
        'age_max_jours',
        'rattrapage_autorise',
    ];

    protected $casts = [
        'numero_dose' => 'integer',
        'age_min_jours' => 'integer',
        'age_recommandee_jours' => 'integer',
        'age_max_jours' => 'integer',
        'rattrapage_autorise' => 'boolean',
    ];

    public function vaccin(): BelongsTo
    {
        return $this->belongsTo(Vaccin::class, 'vaccin_id');
    }

    public function dosesCalendrierEnfant(): HasMany
    {
        return $this->hasMany(DoseCalendrierEnfant::class, 'modele_calendrier_id');
    }
}
