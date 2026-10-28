<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class EvenementSynchronisation extends Model
{
    use HasUuids;

    protected $table = 'evenements_synchronisation';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['event_id', 'idempotency_key', 'device_id', 'schema_version', 'type_evenement', 'type_agregat', 'id_agregat', 'cree_localement_le', 'recu_serveur_le', 'statut', 'erreur_code', 'erreur_detail', 'resolution_conflit', 'charge_utile_hash', 'centre_sante_id', 'auteur_id'];
    protected function casts(): array { return ['cree_localement_le' => 'datetime', 'recu_serveur_le' => 'datetime']; }
}
