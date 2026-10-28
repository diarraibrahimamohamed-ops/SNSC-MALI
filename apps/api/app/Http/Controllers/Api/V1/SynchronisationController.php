<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EvenementSynchronisation;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Registre d'arrivée idempotent pour les événements mobiles.
 *
 * Important : cette route journalise l'arrivée et l'empreinte du payload.
 * Elle ne matérialise pas encore les événements dans les tables métier.
 * La réponse l'indique afin de ne pas faire croire au client hors ligne que
 * le dossier clinique a déjà été appliqué côté serveur.
 */
class SynchronisationController extends Controller
{
    public function sync(Request $request, AccesParStructureService $acces)
    {
        $data = $request->validate([
            'device_id' => ['required', 'string', 'max:120'],
            'events' => ['required', 'array', 'min:1', 'max:100'],
            'events.*.event_id' => ['required', 'uuid', 'distinct'],
            'events.*.idempotency_key' => ['required', 'string', 'max:120', 'distinct'],
            'events.*.schema_version' => ['required', 'string', 'max:30'],
            'events.*.type' => ['required', 'string', 'max:100'],
            'events.*.aggregate_type' => ['required', 'string', 'max:100'],
            'events.*.aggregate_id' => ['required', 'uuid'],
            'events.*.occurred_at' => ['required', 'date'],
            'events.*.payload' => ['required', 'array'],
            'events.*.centre_sante_id' => ['nullable', 'uuid', 'exists:CentreSante,centreId'],
        ]);

        $resultats = collect($data['events'])->map(function (array $event) use ($data, $acces) {
            $centreId = $event['centre_sante_id'] ?? $acces->centreCourant();

            try {
                if (! $centreId) {
                    return [
                        'event_id' => $event['event_id'],
                        'statut' => 'REJETE',
                        'code' => 'STRUCTURE_REQUISE',
                    ];
                }

                $acces->verifierCentre($centreId);
                $hash = hash('sha256', json_encode($event['payload'], JSON_THROW_ON_ERROR));

                $existantParEvenement = EvenementSynchronisation::where('event_id', $event['event_id'])->first();
                $existantParCle = EvenementSynchronisation::where('idempotency_key', $event['idempotency_key'])->first();

                if ($existantParEvenement || $existantParCle) {
                    // Ne pas révéler l'existence d'un événement d'un autre centre.
                    $existant = $existantParEvenement ?? $existantParCle;
                    if (! $acces->estAdministrateur() && $existant->centre_sante_id !== $centreId) {
                        return [
                            'event_id' => $event['event_id'],
                            'statut' => 'REJETE',
                            'code' => 'VALIDATION_OU_AUTORISATION',
                        ];
                    }

                    $memeEnregistrement = $existantParEvenement
                        && $existantParCle
                        && $existantParEvenement->id === $existantParCle->id;

                    $memeContenu = $memeEnregistrement
                        && $existant->event_id === $event['event_id']
                        && $existant->idempotency_key === $event['idempotency_key']
                        && $existant->device_id === $data['device_id']
                        && $existant->schema_version === $event['schema_version']
                        && $existant->type_evenement === $event['type']
                        && $existant->type_agregat === $event['aggregate_type']
                        && $existant->id_agregat === $event['aggregate_id']
                        && $existant->centre_sante_id === $centreId
                        && hash_equals($existant->charge_utile_hash, $hash);

                    if ($memeContenu) {
                        return [
                            'event_id' => $event['event_id'],
                            'statut' => 'DEJA_RECU',
                            'traitement' => 'JOURNAL_SEULEMENT',
                        ];
                    }

                    return [
                        'event_id' => $event['event_id'],
                        'statut' => 'CONFLIT',
                        'code' => 'CLE_REUTILISEE_AVEC_CONTENU_DIFFERENT',
                    ];
                }

                DB::transaction(function () use ($event, $data, $acces, $centreId, $hash) {
                    EvenementSynchronisation::create([
                        'id' => (string) Str::uuid(),
                        'event_id' => $event['event_id'],
                        'idempotency_key' => $event['idempotency_key'],
                        'device_id' => $data['device_id'],
                        'schema_version' => $event['schema_version'],
                        'type_evenement' => $event['type'],
                        'type_agregat' => $event['aggregate_type'],
                        'id_agregat' => $event['aggregate_id'],
                        'cree_localement_le' => $event['occurred_at'],
                        'recu_serveur_le' => now(),
                        'statut' => 'RECU',
                        'charge_utile_hash' => $hash,
                        'centre_sante_id' => $centreId,
                        'auteur_id' => $acces->utilisateur()?->agentId,
                    ]);
                });

                return [
                    'event_id' => $event['event_id'],
                    'statut' => 'RECU_A_TRAITER',
                    'traitement' => 'JOURNAL_SEULEMENT',
                ];
            } catch (AuthorizationException $exception) {
                return [
                    'event_id' => $event['event_id'],
                    'statut' => 'REJETE',
                    'code' => 'VALIDATION_OU_AUTORISATION',
                ];
            } catch (\Throwable $exception) {
                // Log métadonnées uniquement : ne jamais écrire le payload clinique dans les logs.
                Log::warning('Échec de réception d’un événement de synchronisation.', [
                    'event_id' => $event['event_id'] ?? null,
                    'device_id' => $data['device_id'] ?? null,
                    'error_type' => class_basename($exception),
                ]);

                // Une collision concurrente sur les contraintes uniques ne doit pas créer de doublon.
                $eventExiste = EvenementSynchronisation::where('event_id', $event['event_id'])->exists();
                $cleExiste = EvenementSynchronisation::where('idempotency_key', $event['idempotency_key'])->exists();

                return [
                    'event_id' => $event['event_id'],
                    'statut' => ($eventExiste || $cleExiste) ? 'CONFLIT' : 'REJETE',
                    'code' => ($eventExiste || $cleExiste) ? 'CLE_DEJA_UTILISEE' : 'ERREUR_RECEPTION',
                ];
            }
        });

        return response()->json([
            'data' => $resultats,
            'cursor' => now()->toIso8601String(),
            'avertissement' => 'Cette version enregistre les métadonnées et l’empreinte des événements; elle ne répercute pas encore le payload dans les dossiers métier.',
        ]);
    }
}
