<?php

namespace App\Modules\PlanVaccinal\Services;

use App\Models\Enfant;
use App\Models\ModeleCalendrier;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class GenerateurCalendrierService
{
    /**
     * Génère une projection du calendrier vaccinal pour un enfant
     */
    public function genererCalendrier(Enfant $enfant): Collection
    {
        $modeles = ModeleCalendrier::all();
        $dateNaissance = Carbon::parse($enfant->date_naissance);
        $calendrier = collect();

        foreach ($modeles as $modele) {
            $calendrier->push((object)[
                'vaccin_id' => $modele->vaccin_id,
                'date_prevue' => $dateNaissance->copy()->addDays($modele->age_recommandee_jours),
                'dose_numero' => $modele->numero_dose,
            ]);
        }

        return $calendrier;
    }
}
