<?php

namespace App\Services;

use App\Models\Enfant;
use App\Models\ModeleCalendrier;
use App\Models\DoseCalendrierEnfant;
use App\Models\RendezVous;
use App\Models\ScoreRisque;
use Carbon\Carbon;
use Illuminate\Support\Str;

class VaccinationService
{
    /**
     * Génère le calendrier vaccinal complet pour un enfant
     */
    public function genererCalendrierInitial(Enfant $enfant)
    {
        $modeles = ModeleCalendrier::all();
        $dateNaissance = Carbon::parse($enfant->date_naissance);

        foreach ($modeles as $modele) {
            $dateEcheance = $dateNaissance->copy()->addDays($modele->age_recommandee_jours);
            
            DoseCalendrierEnfant::create([
                'id' => (string) Str::uuid(),
                'enfant_id' => $enfant->id,
                'modele_calendrier_id' => $modele->id,
                'date_echeance' => $dateEcheance,
                'debut_fenetre' => $dateNaissance->copy()->addDays($modele->age_min_jours),
                'fin_fenetre' => $dateNaissance->copy()->addDays($modele->age_max_jours),
                'statut' => 'A_VENIR',
            ]);
        }
    }

    /**
     * Évalue le score de risque pour un enfant
     */
    public function evaluerRisque(Enfant $enfant)
    {
        $dosesRetard = DoseCalendrierEnfant::where('enfant_id', $enfant->id)
            ->where('statut', 'A_VENIR')
            ->where('date_echeance', '<', now())
            ->count();

        $niveau = 'FAIBLE';
        $score = 0;

        if ($dosesRetard > 0) {
            $score = $dosesRetard * 20;
            if ($dosesRetard >= 3) {
                $niveau = 'ÉLEVÉ';
            } elseif ($dosesRetard >= 1) {
                $niveau = 'MODÉRÉ';
            }
        }

        ScoreRisque::updateOrCreate(
            ['enfant_id' => $enfant->id],
            [
                'id' => (string) Str::uuid(),
                'version_modele' => 'v1.0',
                'score' => min($score, 100),
                'niveau_risque' => $niveau,
                'confiance' => 0.95,
                'facteurs_explicatifs' => ['doses_retard' => $dosesRetard],
                'calcule_le' => now(),
            ]
        );

        return $niveau;
    }

    /**
     * Planifie les rendez-vous basés sur le calendrier
     */
    public function planifierRendezVous(Enfant $enfant)
    {
        $prochaineDose = DoseCalendrierEnfant::where('enfant_id', $enfant->id)
            ->where('statut', 'A_VENIR')
            ->orderBy('date_echeance', 'asc')
            ->first();

        if ($prochaineDose) {
            RendezVous::updateOrCreate(
                [
                    'enfant_id' => $enfant->id,
                    'dose_calendrier_enfant_id' => $prochaineDose->id,
                ],
                [
                    'id' => (string) Str::uuid(),
                    'date_cible' => $prochaineDose->date_echeance,
                    'statut' => 'PROGRAMME',
                    'cree_le' => now(),
                ]
            );
        }
    }
}
