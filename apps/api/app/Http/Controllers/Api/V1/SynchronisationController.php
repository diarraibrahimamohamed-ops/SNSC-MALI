<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EvenementSynchronisation;
use App\Modules\SanteMaternelle\Services\AccesParStructureService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Registre idempotent des évènements mobiles.
 * Les évènements non pris en charge sont rejetés explicitement, jamais ignorés.
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
            $existant = EvenementSynchronisation::where('event_id', $event['event_id'])
                ->orWhere('idempotency_key', $event['idempotency_key'])
                ->first();
            if ($existant) {
                return ['event_id' => $event['event_id'], 'statut' => 'DEJA_TRAITE'];
            }

            $centreId = $event['centre_sante_id'] ?? $acces->centreCourant();
            try {
                $acces->verifierCentre($centreId);
                $hash = hash('sha256', json_encode($event['payload'], JSON_THROW_ON_ERROR));
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

                return ['event_id' => $event['event_id'], 'statut' => 'ACCEPTE'];
            } catch (\Throwable $exception) {
                return ['event_id' => $event['event_id'], 'statut' => 'REJETE', 'code' => 'VALIDATION_OU_AUTORISATION'];
            }
        });

        return response()->json(['data' => $resultats, 'cursor' => now()->toIso8601String()]);
    }
}
