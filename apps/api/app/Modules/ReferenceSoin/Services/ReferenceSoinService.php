<?php

namespace App\Modules\ReferenceSoin\Services;

use App\Models\ReferenceSoin;
use Illuminate\Validation\ValidationException;

class ReferenceSoinService
{
    private const TRANSITIONS = [
        'CREEE' => ['ENVOYEE', 'ANNULEE'],
        'ENVOYEE' => ['RECUE', 'ANNULEE'],
        'RECUE' => ['PRISE_EN_CHARGE_CONFIRMEE', 'ANNULEE'],
        'PRISE_EN_CHARGE_CONFIRMEE' => ['CLOTUREE'],
        'CLOTUREE' => [],
        'ANNULEE' => [],
    ];

    public function transitionner(ReferenceSoin $reference, string $nouveauStatut, ?string $note = null): ReferenceSoin
    {
        $actuel = $reference->statut;
        if (! in_array($nouveauStatut, self::TRANSITIONS[$actuel] ?? [], true)) {
            throw ValidationException::withMessages([
                'statut' => ["Transition interdite : {$actuel} → {$nouveauStatut}."],
            ]);
        }

        $attributs = ['statut' => $nouveauStatut];
        if ($note !== null) {
            $attributs['note_issue'] = $note;
        }

        match ($nouveauStatut) {
            'ENVOYEE' => $attributs['envoyee_le'] = now(),
            'RECUE' => $attributs['receptionnee_le'] = now(),
            'PRISE_EN_CHARGE_CONFIRMEE' => $attributs['prise_en_charge_le'] = now(),
            'CLOTUREE', 'ANNULEE' => $attributs['cloturee_le'] = now(),
            default => null,
        };

        $reference->update($attributs);

        return $reference->refresh();
    }
}
