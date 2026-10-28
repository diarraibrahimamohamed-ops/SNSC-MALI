<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactPrenatal extends Model
{
    use HasUuids;

    protected $table = 'contacts_prenataux';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['grossesse_id', 'contact_le', 'type_contact', 'age_gestationnel_semaines', 'centre_sante_id', 'auteur_id', 'observations', 'prochaine_etape', 'prochain_rendez_vous_le', 'version_protocole', 'source_donnee', 'statut_validation'];

    protected function casts(): array { return ['contact_le' => 'datetime', 'prochain_rendez_vous_le' => 'date', 'observations' => 'array']; }
    public function grossesse(): BelongsTo { return $this->belongsTo(Grossesse::class, 'grossesse_id'); }
}
