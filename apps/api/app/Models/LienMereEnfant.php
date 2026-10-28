<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LienMereEnfant extends Model
{
    use HasUuids;

    protected $table = 'liens_mere_enfant';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['mere_id', 'enfant_id', 'type_lien', 'date_debut', 'date_fin', 'statut_verification', 'source_donnee', 'auteur_id'];

    protected function casts(): array { return ['date_debut' => 'date', 'date_fin' => 'date']; }
    public function mere(): BelongsTo { return $this->belongsTo(PersonneMere::class, 'mere_id'); }
    public function enfant(): BelongsTo { return $this->belongsTo(DossierEnfant::class, 'enfant_id', 'enfantId'); }
}
