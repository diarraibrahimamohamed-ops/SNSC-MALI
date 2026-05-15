<?php

namespace App\Modules\RisqueIA\Services;

use App\Models\Enfant;
use App\Models\ActeVaccinal;
use Carbon\Carbon;

class CollecteurFeaturesService
{
    /**
     * Collecte les caractéristiques pour le modèle de risque
     */
    public function collecterFeatures(string $enfantId): array
    {
        $enfant = Enfant::with('centreSante')->findOrFail($enfantId);
        $dateNaissance = Carbon::parse($enfant->date_naissance)->startOfDay();
        $maintenant = now()->startOfDay();
        
        $vaccinations = ActeVaccinal::where('enfant_id', $enfantId)
            ->orderBy('administre_le', 'desc')
            ->get();

        $derniereVaccination = $vaccinations->first();
        
        $ageEnMois = (int) $dateNaissance->diffInMonths($maintenant);
        $dateApresMoisComplets = $dateNaissance->copy()->addMonths($ageEnMois);
        $joursEnPlus = (int) $dateApresMoisComplets->diffInDays($maintenant);

        return [
            'age_en_mois' => $ageEnMois,
            'jours_en_plus' => $joursEnPlus,
            'nombre_vaccinations' => $vaccinations->count(),
            'jours_derniere_vaccination' => $derniereVaccination ? Carbon::parse($derniereVaccination->administre_le)->startOfDay()->diffInDays($maintenant) : null,
            'region_centre' => $enfant->centreSante->region ?? null,
            'ville_centre' => $enfant->centreSante->ville ?? null,
            'intervalle_moyen_vaccinations' => $this->calculerIntervalleMoyen($vaccinations),
        ];
    }

    private function calculerIntervalleMoyen($vaccinations): ?float
    {
        if ($vaccinations->count() < 2) {
            return null;
        }

        $intervalles = [];
        for ($i = 0; $i < $vaccinations->count() - 1; $i++) {
            $d1 = Carbon::parse($vaccinations[$i]->administre_le)->startOfDay();
            $d2 = Carbon::parse($vaccinations[$i+1]->administre_le)->startOfDay();
            $intervalles[] = abs($d1->diffInDays($d2));
        }

        return array_sum($intervalles) / count($intervalles);
    }
}
