<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationSmsResource;
use App\Models\NotificationSms;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class NotificationSmsController extends Controller
{
    use AuthorizesRequests;
    public function index()
    {
        $notifications = NotificationSms::with(['enfant', 'rendezVous'])->get();
        return NotificationSmsResource::collection($notifications);
    }

    public function store(Request $request)
    {
        $this->authorize('create', NotificationSms::class);

        $notification = DB::transaction(function () use ($request) {
            return NotificationSms::create($request->all());
        });

        return new NotificationSmsResource($notification);
    }

    public function show(string $id)
    {
        $notification = NotificationSms::with(['enfant', 'rendezVous'])->findOrFail($id);
        $this->authorize('view', $notification);
        return new NotificationSmsResource($notification);
    }

    public function update(Request $request, string $id)
    {
        $notification = NotificationSms::findOrFail($id);
        $this->authorize('update', $notification);

        $notification = DB::transaction(function () use ($request, $notification) {
            $notification->update($request->all());
            return $notification;
        });

        return new NotificationSmsResource($notification);
    }

    public function destroy(string $id)
    {
        $notification = NotificationSms::findOrFail($id);
        $this->authorize('delete', $notification);

        DB::transaction(function () use ($notification) {
            $notification->delete();
        });

        return response()->json(['message' => 'Notification SMS supprimée avec succès']);
    }

    public function declencher(Request $request)
    {
        $this->authorize('create', NotificationSms::class);

        // Envoi de SMS en masse pour les rendez-vous de demain
        $demain = now()->addDay()->toDateString();
        $rendezVous = \App\Models\RendezVous::with(['enfant.tuteurPrincipal'])->whereDate('date_cible', $demain)
            ->where('statut', 'PROGRAMME')
            ->get();

        DB::transaction(function () use ($rendezVous) {
            foreach ($rendezVous as $rv) {
                NotificationSms::create([
                    'id' => (string) Str::uuid(),
                    'enfant_id' => $rv->enfant_id,
                    'rendez_vous_id' => $rv->id,
                    'numero_telephone' => $rv->enfant->tuteurPrincipal->telephone ?? '00000000',
                    'contenu_message' => "Rappel : Rendez-vous vaccination pour votre enfant demain.",
                    'statut_livraison' => 'ENVOYE',
                    'envoye_le' => now(),
                ]);
            }
        });

        return response()->json(['message' => 'Relances déclenchées avec succès', 'count' => count($rendezVous)]);
    }
}
