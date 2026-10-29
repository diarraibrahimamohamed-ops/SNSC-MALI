<?php

namespace App\Console\Commands;

use App\Models\Consentement;
use App\Models\RendezVousPrenatal;
use App\Services\TelerivetService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Throwable;

class EnvoyerRappelsPrenataux extends Command
{
    protected $signature = 'maternite:rappels-prenataux {--limit=100 : Nombre maximal de rappels à traiter}';

    protected $description = 'Envoie les rappels SMS prénataux autorisés par un consentement actif';

    public function handle(TelerivetService $sms): int
    {
        $limit = max(1, min((int) $this->option('limit'), 500));
        $staleBefore = now()->subMinutes(15);

        $ids = RendezVousPrenatal::query()
            ->where('statut', 'PLANIFIE')
            ->whereNotNull('rappel_programme_le')
            ->whereDate('prevu_le', '>=', today())
            ->where(function ($query) use ($staleBefore) {
                $query->where(function ($pending) {
                    $pending->where('rappel_statut', 'EN_ATTENTE');
                })->orWhere(function ($stale) use ($staleBefore) {
                    $stale->where('rappel_statut', 'EN_COURS')
                        ->where('rappel_debut_traitement_le', '<=', $staleBefore);
                });
            })
            ->where('rappel_programme_le', '<=', now())
            ->orderBy('rappel_programme_le')
            ->limit($limit)
            ->pluck('id');

        $sent = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($ids as $id) {
            $appointment = DB::transaction(function () use ($id, $staleBefore) {
                $record = RendezVousPrenatal::whereKey($id)->lockForUpdate()->first();

                if (
                    ! $record
                    || $record->statut !== 'PLANIFIE'
                    || ! $record->rappel_programme_le
                    || $record->rappel_programme_le->isFuture()
                    || $record->prevu_le->lt(today())
                ) {
                    return null;
                }

                $eligible = $record->rappel_statut === 'EN_ATTENTE'
                    || (
                        $record->rappel_statut === 'EN_COURS'
                        && $record->rappel_debut_traitement_le !== null
                        && $record->rappel_debut_traitement_le->lte($staleBefore)
                    );

                if (! $eligible) {
                    return null;
                }

                $record->update([
                    'rappel_statut' => 'EN_COURS',
                    'rappel_debut_traitement_le' => now(),
                    'rappel_tentatives' => $record->rappel_tentatives + 1,
                    'rappel_erreur_code' => null,
                ]);

                return $record->fresh(['grossesse.mere']);
            });

            if (! $appointment) {
                continue;
            }

            $mother = $appointment->grossesse?->mere;
            $consent = $mother
                ? Consentement::query()
                    ->where('sujet_type', 'MERE')
                    ->where('sujet_id', $mother->id)
                    ->where('centre_sante_id', $appointment->centre_sante_id)
                    ->where('finalite', 'SMS_RENDEZ_VOUS')
                    ->where('statut', 'ACTIF')
                    ->whereNull('retire_le')
                    ->exists()
                : false;

            if (! $consent) {
                $appointment->update([
                    'rappel_statut' => 'IGNORE_SANS_CONSENTEMENT',
                    'rappel_debut_traitement_le' => null,
                    'rappel_erreur_code' => 'CONSENTEMENT_SMS_ABSENT',
                ]);
                $skipped++;
                continue;
            }

            if (! $mother || ! is_string($mother->telephone) || trim($mother->telephone) === '') {
                $appointment->update([
                    'rappel_statut' => 'IGNORE_SANS_TELEPHONE',
                    'rappel_debut_traitement_le' => null,
                    'rappel_erreur_code' => 'TELEPHONE_ABSENT',
                ]);
                $skipped++;
                continue;
            }

            // A reminder is intentionally generic: it does not mention pregnancy, tests, symptoms or results.
            $date = $appointment->prevu_le->locale('fr')->isoFormat('D MMMM YYYY');
            $message = "Bonjour. Un rendez-vous est prévu le {$date} auprès de votre structure de santé. Pour toute précision, contactez votre centre de santé.";

            try {
                $result = $sms->sendSms($mother->telephone, $message);
                if (($result['success'] ?? false) === true) {
                    $appointment->update([
                        'rappel_statut' => 'ENVOYE',
                        'rappel_envoye_le' => now(),
                        'rappel_debut_traitement_le' => null,
                        'rappel_erreur_code' => null,
                    ]);
                    $sent++;
                } else {
                    $error = (string) ($result['error'] ?? 'FOURNISSEUR_SMS_INDISPONIBLE');
                    $appointment->update([
                        'rappel_statut' => 'ECHEC',
                        'rappel_debut_traitement_le' => null,
                        'rappel_erreur_code' => mb_substr(preg_replace('/[^A-Z0-9_]/', '_', mb_strtoupper($error)) ?: 'ERREUR_SMS', 0, 80),
                    ]);
                    $failed++;
                }
            } catch (Throwable $exception) {
                report($exception);
                $appointment->update([
                    'rappel_statut' => 'ECHEC',
                    'rappel_debut_traitement_le' => null,
                    'rappel_erreur_code' => 'EXCEPTION_FOURNISSEUR_SMS',
                ]);
                $failed++;
            }
        }

        // Aggregate-only output: no names, phone numbers or clinical data.
        $this->info("Rappels traités : {$sent} envoyés, {$skipped} ignorés, {$failed} échecs.");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}
