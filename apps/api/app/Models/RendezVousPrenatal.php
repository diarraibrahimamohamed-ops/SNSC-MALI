<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RendezVousPrenatal extends Model
{
    use HasUuids;

    protected $table = 'rendez_vous_prenataux';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'grossesse_id',
        'centre_sante_id',
        'contact_prenatal_id',
        'auteur_id',
        'prevu_le',
        'type_rendez_vous',
        'libelle',
        'statut',
        'realise_le',
        'motif',
        'remplace_rendez_vous_id',
        'rappel_programme_le',
        'rappel_statut',
        'rappel_debut_traitement_le',
        'rappel_envoye_le',
        'rappel_tentatives',
        'rappel_erreur_code',
    ];

    protected function casts(): array
    {
        return [
            'prevu_le' => 'date',
            'realise_le' => 'datetime',
            'rappel_programme_le' => 'datetime',
            'rappel_debut_traitement_le' => 'datetime',
            'rappel_envoye_le' => 'datetime',
            'rappel_tentatives' => 'integer',
        ];
    }

    public function grossesse(): BelongsTo
    {
        return $this->belongsTo(Grossesse::class, 'grossesse_id');
    }

    public function contactPrenatal(): BelongsTo
    {
        return $this->belongsTo(ContactPrenatal::class, 'contact_prenatal_id');
    }

    public function centreSante(): BelongsTo
    {
        return $this->belongsTo(CentreSante::class, 'centre_sante_id', 'centreId');
    }

    public function rendezVousRemplace(): BelongsTo
    {
        return $this->belongsTo(self::class, 'remplace_rendez_vous_id');
    }
}
