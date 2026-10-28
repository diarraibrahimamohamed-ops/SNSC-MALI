<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Consentement extends Model
{
    use HasUuids;

    protected $table = 'consentements';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['sujet_type', 'sujet_id', 'finalite', 'version_notice', 'canal', 'statut', 'consenti_le', 'retire_le', 'representant_autorise_id', 'centre_sante_id', 'auteur_id'];
    protected function casts(): array { return ['consenti_le' => 'datetime', 'retire_le' => 'datetime']; }
}
