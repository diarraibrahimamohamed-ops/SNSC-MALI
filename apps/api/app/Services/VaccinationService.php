<?php

namespace App\Services;

use App\Models\Enfant;
use App\Models\ModeleCalendrier;
use App\Models\DoseCalendrierEnfant;
use App\Models\RendezVous;
use App\Models\ScoreRisque;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
        $dosesRetardQuery = DoseCalendrierEnfant::where('enfant_id', $enfant->id)
            ->where('statut', 'A_VENIR')
            ->where('date_echeance', '<', now())
            ->get();
            
        $maxRetardJours = 0;
        foreach($dosesRetardQuery as $dose) {
            $retard = Carbon::parse($dose->date_echeance)->diffInDays(now());
            if ($retard > $maxRetardJours) {
                $maxRetardJours = $retard;
            }
        }
        
        $rendezVousManques = $dosesRetardQuery->count();

        try {
            $iaApiUrl = config('services.ia.api_url', 'http://localhost:8001');
            $response = Http::timeout(10)->post("{$iaApiUrl}/predict", [
                'enfant_id' => $enfant->id,
                'features' => [
                    'retards_jours' => $maxRetardJours,
                    'rendez_vous_manques' => $rendezVousManques,
                    'distance_km' => 5 // Distance par défaut
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                ScoreRisque::create([
                    'enfant_id' => $enfant->id,
                    'version_modele' => 'v1.0', // Could be fetched from AI response if dynamic
                    'score' => $data['score'] ?? 0,
                    'niveau_risque' => $data['niveau_risque'] ?? 'BAS',
                    'confiance' => $data['confiance'] ?? 0.85,
                    'facteurs_explicatifs' => $data['facteurs_explicatifs'] ?? [],
                    'calcule_le' => now(),
                ]);

                return $data['niveau_risque'] ?? 'BAS';
            }

            Log::error('Erreur API IA: Réponse non fructueuse', ['status' => $response->status(), 'body' => $response->body()]);
        } catch (\Exception $e) {
            Log::error('Erreur de connexion à l\'API IA: ' . $e->getMessage());
        }

        // Fallback local en cas d'échec de l'IA
        $dosesRetard = $rendezVousManques;

        $niveau = 'BAS';
        $score = 0;

        if ($dosesRetard > 0) {
            $score = $dosesRetard * 20;
            if ($dosesRetard >= 3) {
                $niveau = 'ELEVE';
            } elseif ($dosesRetard >= 1) {
                $niveau = 'MOYEN';
            }
        }

        ScoreRisque::create([
            'enfant_id' => $enfant->id,
            'version_modele' => 'fallback-v1.0',
            'score' => min($score, 100),
            'niveau_risque' => $niveau,
            'confiance' => 0.50, // Lower confidence for fallback
            'facteurs_explicatifs' => ['doses_retard' => $dosesRetard, 'source' => 'fallback_local'],
            'calcule_le' => now(),
        ]);

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
                    'date_cible' => $prochaineDose->date_echeance,
                    'statut' => 'PLANIFIE',
                    'cree_le' => now(),
                ]
            );
        }
    }
}
