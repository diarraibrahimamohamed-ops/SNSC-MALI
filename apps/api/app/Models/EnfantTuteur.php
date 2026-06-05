<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnfantTuteur extends Model
{
    protected $table = 'enfant_tuteurs';

    protected $fillable = [
        'enfant_id',
        'tuteur_id',
        'type_relation',
        'est_principal',
    ];

    protected $casts = [
        'est_principal' => 'boolean',
    ];

    public $incrementing = false;

    protected $primaryKey = ['enfant_id', 'tuteur_id'];

    public function enfant(): BelongsTo
    {
        return $this->belongsTo(Enfant::class, 'enfant_id');
    }

    public function tuteur(): BelongsTo
    {
        return $this->belongsTo(Tuteur::class, 'tuteur_id');
    }
}
