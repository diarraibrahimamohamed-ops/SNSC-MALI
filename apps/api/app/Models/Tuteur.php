<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tuteur extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id',
        'nom_complet',
        'telephone',
        'adresse',
        'consentement_donne',
        'cree_le',
    ];

    protected $casts = [
        'consentement_donne' => 'boolean',
        'cree_le' => 'datetime',
    ];

    public function enfants(): BelongsToMany
    {
        return $this->belongsToMany(Enfant::class, 'enfant_tuteurs', 'tuteur_id', 'enfant_id')
            ->withPivot('type_relation', 'est_principal');
    }

    public function notificationsSms(): HasMany
    {
        return $this->hasMany(NotificationSms::class, 'tuteur_id');
    }
}
