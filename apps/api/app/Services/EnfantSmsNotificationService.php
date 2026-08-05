<?php

namespace App\Services;

use App\Models\DossierEnfant;
use App\Models\Tuteur;
use App\Modules\PlanVaccinal\Data\PevMaliSchedule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Service responsable de l'envoi de SMS de confirmation lors de l'enregistrement
 * d'un enfant et de la notification du calendrier vaccinal au tuteur.
 */
class EnfantSmsNotificationService
{
    private SmsService $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }

    /**
     * Envoyer un SMS de confirmation d'enregistrement au tuteur
     * avec le calendrier vaccinal de l'enfant.
     */
    public function envoyerConfirmationEnregistrement(DossierEnfant $enfant): array
    {
        $tuteur = $enfant->tuteur;

        if (!$tuteur || empty($tuteur->telephone)) {
            Log::warning('SMS Confirmation: Tuteur ou téléphone manquant', [
                'enfant_id' => $enfant->enfantId,
            ]);
            return [
                'success' => false,
                'error' => 'Tuteur ou numéro de téléphone manquant',
            ];
        }

        $message = $this->construireMessageConfirmation($enfant, $tuteur);

        $result = $this->smsService->sendSms($tuteur->telephone, $message);

        Log::info('SMS Confirmation enregistrement envoyé', [
            'enfant_id' => $enfant->enfantId,
            'success' => $result['success'],
        ]);

        return $result;
    }

    /**
     * Construit le message SMS de confirmation avec calendrier vaccinal.
     */
    private function construireMessageConfirmation(DossierEnfant $enfant, Tuteur $tuteur): string
    {
        $nomEnfant = trim(($enfant->prenom ?? '') . ' ' . ($enfant->nom ?? ''));
        if (empty($nomEnfant)) {
            $nomEnfant = 'votre enfant';
        }

        $dateNaissance = Carbon::parse($enfant->dateNaissance);
        $dateNaissanceStr = $dateNaissance->format('d/m/Y');

        // Construire la liste des prochains vaccins
        $prochainVaccins = $this->getProchainVaccins($dateNaissance, $enfant->sexe);

        $message = "SNSC MALI - Confirmation\n";
        $message .= "Cher(e) {$tuteur->nomComplet},\n";
        $message .= "{$nomEnfant} (né(e) le {$dateNaissanceStr}) a été enregistré(e) avec succès dans le système de suivi vaccinal.\n\n";

        if (!empty($prochainVaccins)) {
            $message .= "CALENDRIER VACCINAL:\n";
            foreach ($prochainVaccins as $vaccin) {
                $message .= "- {$vaccin['nom']}: {$vaccin['date']}\n";
            }
        }

        $message .= "\nPrésentez-vous au centre de santé aux dates indiquées. Merci!";

        // Limiter à 1600 caractères (limite Telerivet)
        if (strlen($message) > 1550) {
            $message = mb_substr($message, 0, 1530) . "\n...Présentez-vous au centre.";
        }

        return $message;
    }

    /**
     * Calcule les prochains vaccins selon le calendrier PEV Mali.
     *
     * @return array<array{nom: string, date: string, code: string}>
     */
    private function getProchainVaccins(Carbon $dateNaissance, ?string $sexe): array
    {
        $today = Carbon::today();
        $vaccins = [];

        foreach (PevMaliSchedule::allRules() as $code => $rule) {
            // Filtrer par sexe
            if ($rule['sex'] && strtoupper($sexe ?? '') !== $rule['sex']) {
                continue;
            }

            $datePrevue = $dateNaissance->copy()->addDays($rule['min_age_days']);

            // Ne montrer que les vaccins à venir ou du jour
            if ($datePrevue->gte($today) || $datePrevue->isSameDay($today)) {
                $label = $this->getVaccinNom($code);
                $vaccins[] = [
                    'nom' => $label,
                    'date' => $datePrevue->isSameDay($today)
                        ? "Aujourd'hui ({$datePrevue->format('d/m/Y')})"
                        : $datePrevue->format('d/m/Y'),
                    'code' => $code,
                    'days' => $rule['min_age_days'],
                ];
            }
        }

        // Si le bébé vient de naître, tous les vaccins sont à venir
        // On inclut aussi BCG qui est dès la naissance
        if (empty($vaccins) || $dateNaissance->isSameDay($today)) {
            // Forcer l'ajout du BCG si naissance aujourd'hui
            $bcgRule = PevMaliSchedule::ruleForCode('BCG');
            if ($bcgRule) {
                $existingCodes = array_column($vaccins, 'code');
                if (!in_array('BCG', $existingCodes)) {
                    array_unshift($vaccins, [
                        'nom' => 'BCG + Polio 0',
                        'date' => "Aujourd'hui ({$today->format('d/m/Y')})",
                        'code' => 'BCG',
                        'days' => 0,
                    ]);
                }
            }
        }

        // Trier par date et limiter à 5 pour ne pas dépasser la taille SMS
        usort($vaccins, fn($a, $b) => $a['days'] - $b['days']);

        return array_slice($vaccins, 0, 5);
    }

    /**
     * Retourne le nom lisible d'un vaccin à partir de son code PEV.
     */
    private function getVaccinNom(string $code): string
    {
        return match ($code) {
            'BCG' => 'BCG + Polio 0',
            'PENTA_1' => 'Penta1 + Rota1 + PCV13(1)',
            'VPO_1' => 'VPO1',
            'PENTA_2' => 'Penta2 + Rota2 + PCV13(2)',
            'VPO_2' => 'VPO2',
            'PENTA_3' => 'Penta3 + Rota3 + PCV13(3)',
            'VPO_3' => 'VPO3',
            'VPI' => 'VPI (Polio Injectable)',
            'VIT_A' => 'Vitamine A',
            'VAR' => 'Vaccin Anti-Rougeole',
            'VAA' => 'Vaccin Anti-Amaril',
            'MEN_A' => 'MenAfriVac (Méningite A)',
            'HPV' => 'HPV',
            default => $code,
        };
    }
}
