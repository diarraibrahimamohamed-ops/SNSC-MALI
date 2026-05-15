<?php

namespace App\Modules\PlanVaccinal\Services;

use App\Models\Enfant;
use App\Models\Vaccin;
use App\Models\ActeVaccinal;
use Carbon\Carbon;

class ValidationDoseService
{
    /**
     * Valide si une dose peut être administrée à un enfant
     */
    public function validerDose(Enfant $enfant, Vaccin $vaccin, int $numeroDose): bool
    {
        $dateNaissance = Carbon::parse($enfant->date_naissance);
        $ageEnSemaines = $dateNaissance->diffInWeeks(now());

        // Exemple simple : BCG (doit être fait à la naissance ou très tôt)
        if ($vaccin->nom === 'BCG' && $ageEnSemaines > 4) {
            // Dans un vrai système, on permettrait le rattrapage, 
            // mais ici on suit une règle stricte pour le test.
            return false;
        }

        // Vérifier l'intervalle avec la dose précédente
        if ($numeroDose > 1) {
            $derniereDose = ActeVaccinal::where('enfant_id', $enfant->id)
                ->where('vaccin_id', $vaccin->id)
                ->orderBy('administre_le', 'desc')
                ->first();

            if ($derniereDose) {
                $dateDerniereDose = Carbon::parse($derniereDose->administre_le);
                if ($dateDerniereDose->diffInWeeks(now()) < 4) {
                    return false;
                }
            }
        }

        return true;
    }
}
