<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;

#[Fillable(['nom', 'prenom', 'email', 'matricule', 'password', 'telephone', 'role', 'centre_sante_id', 'est_actif'])]
class Admin extends Authenticatable implements JWTSubject
{
    use HasUuids, Notifiable;

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return [
            'est_actif' => 'boolean',
            'derniere_connexion' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function centreSante(): BelongsTo
    {
        return $this->belongsTo(CentreSante::class, 'centre_sante_id');
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [];
    }

    // For compatibility with frontend expecting nom_complet
    public function getNomCompletAttribute()
    {
        return $this->nom . ' ' . $this->prenom;
    }
