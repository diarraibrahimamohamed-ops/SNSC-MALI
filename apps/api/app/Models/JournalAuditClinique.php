<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class JournalAuditClinique extends Model
{
    use HasUuids;

    protected $table = 'journal_audit_clinique';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $fillable = ['acteur_id', 'action', 'sujet_type', 'sujet_id', 'centre_sante_id', 'resultat', 'correlation_id', 'metadonnees_minimales', 'survenu_le'];
    protected function casts(): array { return ['metadonnees_minimales' => 'array', 'survenu_le' => 'datetime']; }
}
