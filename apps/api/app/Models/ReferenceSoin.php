<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferenceSoin extends Model
{
    use HasUuids;

    public const STATUTS = ['CREEE', 'ENVOYEE', 'RECUE', 'PRISE_EN_CHARGE_CONFIRMEE', 'CLOTUREE', 'ANNULEE'];

    protected $table = 'references_soins';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['patient_type', 'patient_id', 'grossesse_id', 'centre_emetteur_id', 'centre_destinataire_id', 'motif_code', 'priorite', 'statut', 'cree_le', 'envoyee_le', 'receptionnee_le', 'prise_en_charge_le', 'cloturee_le', 'transport', 'responsable_suivi_id', 'note_issue'];
    protected function casts(): array { return ['cree_le' => 'datetime', 'envoyee_le' => 'datetime', 'receptionnee_le' => 'datetime', 'prise_en_charge_le' => 'datetime', 'cloturee_le' => 'datetime']; }
    public function grossesse(): BelongsTo { return $this->belongsTo(Grossesse::class, 'grossesse_id'); }
    public function centreEmetteur(): BelongsTo { return $this->belongsTo(CentreSante::class, 'centre_emetteur_id', 'centreId'); }
    public function centreDestinataire(): BelongsTo { return $this->belongsTo(CentreSante::class, 'centre_destinataire_id', 'centreId'); }
}
