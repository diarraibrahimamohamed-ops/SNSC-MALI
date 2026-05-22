<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\Auditable;

class FileSynchronisation extends Model
{
    use HasFactory, HasUuids, Auditable;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;
    protected $table = 'file_synchronisation';

    protected $fillable = [
        'id',
        'id_appareil',
        'type_agregat',
        'id_agregat',
        'type_operation',
        'charge_utile',
        'statut_sync',
        'derniere_erreur',
        'cree_le',
        'synchronise_le',
    ];

    protected $casts = [
        'charge_utile' => 'array',
        'cree_le' => 'datetime',
        'synchronise_le' => 'datetime',
    ];
}
