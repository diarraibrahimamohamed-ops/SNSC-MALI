<?php

namespace App\Modules\RelanceSMS\Services;

use App\Models\DossierEnfant;
use App\Models\NotificationSMS;
use App\Models\RendezVousVaccinal;
use App\Models\ScoreRisqueVaccinal;
use App\Modules\Audit\Services\AuditService;
use App\Modules\RelanceSMS\Integrations\SmsMessageBuilder;
use App\Services\SmsService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RelanceService
{
    public function __construct(
        private readonly SmsService $smsService,
        private readonly SmsMessageBuilder $messageBuilder,
        private readonly AuditService $auditService
    ) {}

    /**
     * Charge et traite les rendez-vous à rappeler.
     */
    public function declencherRelances(?array $enfantIds = null): array
    {
        $rdvs = $this->chargerRendezVousARappeler($enfantIds);
        $resultats = ['envoyes' => 0, 'echecs' => 0, 'ignores' => 0, 'details' => []];

        foreach ($rdvs as $rdv) {
            $resultat = $this->traiterRendezVous($rdv);
            $resultats['details'][] = $resultat;

            match ($resultat['statut']) {
                'ENVOYE' => $resultats['envoyes']++,
                'NON_ENVOYE' => $resultats['echecs']++,
                default => $resultats['ignores']++,
            };
        }

        return $resultats;
    }

    public function listerNotifications(): Collection
    {
        return NotificationSMS::with([
            'rendezVous.dossierEnfant.tuteur',
            'rendezVous.dosePlanifiee',
        ])
            ->orderByDesc('dateEnvoi')
            ->get()
            ->map(fn (NotificationSMS $n) => $this->mapperNotification($n));
    }

    private function chargerRendezVousARappeler(?array $enfantIds = null): Collection
    {
        $delaiJours = config('sms.relance_delai_jours', 3);
        $limite = Carbon::today()->addDays($delaiJours);

        $query = RendezVousVaccinal::with(['dossierEnfant.tuteur', 'dossierEnfant.centreSante', 'dosePlanifiee'])
            ->where('datePrevue', '<=', $limite);

        if ($enfantIds) {
            $query->whereIn('enfantId', $enfantIds);
        }

        return $query->get()->filter(fn (RendezVousVaccinal $rdv) => $this->politiqueAutoriseEnvoi($rdv));
    }

    private function politiqueAutoriseEnvoi(RendezVousVaccinal $rdv): bool
    {
        $cooldownHeures = config('sms.relance_cooldown_heures', 24);

        $derniereNotif = NotificationSMS::where('rdvId', $rdv->rdvId)
            ->where('statutLivraison', 'ENVOYE')
            ->orderByDesc('dateEnvoi')
            ->first();

        if (! $derniereNotif || ! $derniereNotif->dateEnvoi) {
            return true;
        }

        return Carbon::parse($derniereNotif->dateEnvoi)->addHours($cooldownHeures)->isPast();
    }

    private function traiterRendezVous(RendezVousVaccinal $rdv): array
    {
        $enfant = $rdv->dossierEnfant;
        $tuteur = $enfant?->tuteur;
        $telephone = $tuteur?->telephone ?? '';

        if (! $enfant || ! $tuteur || empty($telephone)) {
            return $this->enregistrerEchec($rdv, $enfant, 'Numéro de contact manquant');
        }

        $niveauRisque = $this->obtenirNiveauRisque($enfant);
        $message = $this->messageBuilder->construire($rdv, $niveauRisque);

        $resultatSms = $this->envoyerAvecRetry($telephone, $message);

        if (! $resultatSms['success']) {
            $this->auditService->journaliser(
                "RELANCE_SMS_ECHEC: {$resultatSms['error']} (RDV {$rdv->rdvId})",
                $enfant->enfantId
            );

            return $this->enregistrerEchec($rdv, $enfant, $resultatSms['error'] ?? 'Échec envoi SMS');
        }

        $notification = NotificationSMS::create([
            'notificationId' => (string) Str::uuid(),
            'dateEnvoi' => now(),
            'statutLivraison' => 'ENVOYE',
            'rdvId' => $rdv->rdvId,
        ]);

        $this->auditService->journaliser(
            "RELANCE_SMS_ENVOYE: niveau_risque={$niveauRisque} (RDV {$rdv->rdvId})",
            $enfant->enfantId
        );

        return [
            'statut' => 'ENVOYE',
            'notification_id' => $notification->notificationId,
            'enfant_id' => $enfant->enfantId,
            'telephone' => $telephone,
            'message' => $message,
            'niveau_risque' => $niveauRisque,
        ];
    }

    private function envoyerAvecRetry(string $telephone, string $message): array
    {
        $maxRetries = config('sms.max_retries', 3);
        $delayMs = config('sms.retry_delay_ms', 1000);
        $derniereErreur = 'Serveur SMS ne répond pas';

        for ($tentative = 1; $tentative <= $maxRetries; $tentative++) {
            $resultat = $this->smsService->sendSms($telephone, $message);

            if ($resultat['success']) {
                return $resultat;
            }

            $derniereErreur = $resultat['error'] ?? 'Erreur inconnue';

            if (str_contains(strtolower($derniereErreur), 'invalide')) {
                return $resultat;
            }

            if ($tentative < $maxRetries) {
                usleep($delayMs * 1000);
            }
        }

        Log::critical('SMS: échec persistant après retries — alerte administrateur technique', [
            'telephone' => substr($telephone, 0, -4) . '****',
            'tentatives' => $maxRetries,
        ]);

        return ['success' => false, 'error' => $derniereErreur];
    }

    private function obtenirNiveauRisque(DossierEnfant $enfant): string
    {
        $score = ScoreRisqueVaccinal::where('enfantId', $enfant->enfantId)
            ->orderByDesc('dateCalcul')
            ->first();

        return $score?->niveauCode ?? 'FAIBLE';
    }

    private function enregistrerEchec(RendezVousVaccinal $rdv, ?DossierEnfant $enfant, string $raison): array
    {
        NotificationSMS::create([
            'notificationId' => (string) Str::uuid(),
            'dateEnvoi' => now(),
            'statutLivraison' => 'NON_ENVOYE',
            'rdvId' => $rdv->rdvId,
        ]);

        if ($enfant) {
            $this->auditService->journaliser(
                "RELANCE_SMS_NON_ENVOYE: {$raison} (RDV {$rdv->rdvId})",
                $enfant->enfantId
            );
        }

        return [
            'statut' => 'NON_ENVOYE',
            'enfant_id' => $enfant?->enfantId,
            'raison' => $raison,
        ];
    }

    private function mapperNotification(NotificationSMS $notification): array
    {
        $rdv = $notification->rendezVous;
        $enfant = $rdv?->dossierEnfant;
        $tuteur = $enfant?->tuteur;

        return [
            'id' => $notification->notificationId,
            'telephone' => $tuteur?->telephone ?? '',
            'message' => $rdv ? $this->messageBuilder->construire($rdv, $this->obtenirNiveauRisque($enfant)) : '',
            'statut' => $notification->statutLivraison,
            'date_envoi' => $notification->dateEnvoi,
            'enfant' => $enfant ? [
                'id' => $enfant->enfantId,
                'nom' => $enfant->nom,
                'prenom' => $enfant->prenom,
            ] : null,
        ];
    }
}
