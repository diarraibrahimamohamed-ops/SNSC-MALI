<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\DossierEnfant;
use App\Models\Tuteur;
use App\Models\ActeVaccinal;
use App\Models\RendezVousVaccinal;
use App\Models\CentreSante;
use App\Models\Vaccin;
use App\Models\AgentSante;
use App\Support\PdmApiMapper;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MobileSyncController extends Controller
{
    /**
     * Endpoint pour recevoir les données créées hors-ligne par l'application mobile.
     */
    public function sync(Request $request)
    {
        $this->verifySignature($request);

        $payload = $request->json()->all();
        $results = [
            'success' => true,
            'processed' => 0,
            'errors' => []
        ];

        DB::beginTransaction();
        try {
            // 1. Synchroniser les Tuteurs
            if (isset($payload['tuteurs']) && is_array($payload['tuteurs'])) {
                foreach ($payload['tuteurs'] as $tuteurData) {
                    try {
                        Tuteur::updateOrCreate(
                            ['tuteurId' => $tuteurData['id']],
                            [
                                'nomComplet' => $tuteurData['nom_complet'],
                                'telephone' => $tuteurData['telephone'],
                            ]
                        );
                        $results['processed']++;
                    } catch (\Exception $e) {
                        $results['errors'][] = ['type' => 'tuteur', 'id' => $tuteurData['id'], 'error' => $e->getMessage()];
                    }
                }
            }

            // 2. Synchroniser les Enfants
            if (isset($payload['enfants']) && is_array($payload['enfants'])) {
                foreach ($payload['enfants'] as $enfantData) {
                    try {
                        DossierEnfant::updateOrCreate(
                            ['enfantId' => $enfantData['id']],
                            [
                                'identifiantSanitaire' => $enfantData['identifiant_sanitaire'] ?? 'ENF-' . time(),
                                'nom' => $enfantData['nom'] ?? '',
                                'prenom' => $enfantData['prenom'],
                                'dateNaissance' => Carbon::parse($enfantData['date_naissance'])->format('Y-m-d H:i:s'),
                                'sexe' => $enfantData['sexe'],
                                'tuteurId' => $enfantData['tuteur_id'],
                                'centreId' => $enfantData['centre_sante_id'],
                            ]
                        );
                        
                        // Si c'est une création, on génère le calendrier
                        if (DossierEnfant::where('enfantId', $enfantData['id'])->wasRecentlyCreated) {
                            $calendrier = \App\Models\CalendrierVaccinal::create([
                                'calendrierId' => (string) \Str::uuid(),
                                'dateCreation' => now(),
                                'enfantId' => $enfantData['id'],
                            ]);
                            
                            $enfant = DossierEnfant::find($enfantData['id']);
                            app(\App\Modules\PlanVaccinal\Services\CalendrierPevService::class)->genererDosesPlanifiees($enfant, $calendrier);
                            
                            // Envoi SMS automatique via Telerivet
                            try {
                                app(\App\Services\EnfantSmsNotificationService::class)->envoyerConfirmationEnregistrement($enfant);
                            } catch (\Exception $e) {
                                Log::error('Mobile Sync: Erreur SMS confirmation - ' . $e->getMessage());
                            }
                        }
                        
                        $results['processed']++;
                    } catch (\Exception $e) {
                        $results['errors'][] = ['type' => 'enfant', 'id' => $enfantData['id'], 'error' => $e->getMessage()];
                    }
                }
            }

            // 3. Synchroniser les Actes Vaccinaux
            if (isset($payload['actes_vaccinaux']) && is_array($payload['actes_vaccinaux'])) {
                foreach ($payload['actes_vaccinaux'] as $acteData) {
                    try {
                        // Vérifier la dose planifiée
                        $statutCode = 'ADMINISTRE';
                        \App\Models\StatutVaccinal::firstOrCreate(
                            ['code' => $statutCode],
                            ['libelle' => 'Administré']
                        );

                        ActeVaccinal::updateOrCreate(
                            ['acteId' => $acteData['id']],
                            [
                                'dateActe' => Carbon::parse($acteData['administre_le'])->format('Y-m-d H:i:s'),
                                'lotVaccin' => $acteData['numero_lot'] ?? null,
                                'enfantId' => $acteData['enfant_id'],
                                'vaccinId' => $acteData['vaccin_id'],
                                'statutCode' => $statutCode,
                                'agentId' => $acteData['agent_id'],
                            ]
                        );
                        $results['processed']++;
                    } catch (\Exception $e) {
                        $results['errors'][] = ['type' => 'acte_vaccinal', 'id' => $acteData['id'], 'error' => $e->getMessage()];
                    }
                }
            }

            if (count($results['errors']) > 0) {
                Log::warning('Synchronisation mobile avec erreurs', $results);
            }

            DB::commit();
            return response()->json($results);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur fatale synchronisation mobile', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Erreur de synchronisation', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Endpoint pour l'application mobile pour récupérer les données.
     */
    public function pull(Request $request)
    {
        $this->verifySignature($request);

        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }

        $lastSync = $request->query('last_sync');
        $queryDate = $lastSync ? Carbon::parse($lastSync) : Carbon::create(2000, 1, 1);

        // Récupérer les centres de santé
        $centres = CentreSante::all();

        // Récupérer les vaccins
        $vaccins = Vaccin::all();

        // Récupérer les données spécifiques au centre de l'agent
        $enfants = collect();
        $tuteurs = collect();
        $actes = collect();

        if ($user->centreId) {
            $enfants = DossierEnfant::where('centreId', $user->centreId)->get();
            
            $tuteurIds = $enfants->pluck('tuteurId')->unique();
            $tuteurs = Tuteur::whereIn('tuteurId', $tuteurIds)->get();

            $enfantIds = $enfants->pluck('enfantId');
            $actes = ActeVaccinal::whereIn('enfantId', $enfantIds)->get();
        } elseif ($user->role === 'ADMIN') {
             // Admin récupère tout (simplifié, en prod on ferait de la pagination)
             $enfants = DossierEnfant::all();
             $tuteurs = Tuteur::all();
             $actes = ActeVaccinal::all();
        }

        return response()->json([
            'data' => [
                'centres_sante' => $centres,
                'vaccins' => $vaccins,
                'tuteurs' => $tuteurs,
                'enfants' => $enfants->map(fn($e) => PdmApiMapper::enfant($e)),
                'actes_vaccinaux' => $actes->map(fn($a) => PdmApiMapper::acte($a)),
                'timestamp' => now()->toIso8601String(),
            ]
        ]);
    }

    /**
     * Vérifie la signature HMAC de la requête pour sécuriser la synchronisation.
     */
    private function verifySignature(Request $request): void
    {
        $signature = $request->header('X-Sync-Signature');
        $deviceId = $request->header('X-Device-ID');
        $secret = config('app.mobile_sync_hmac_secret', env('MOBILE_SYNC_HMAC_SECRET', 'default_secret'));

        if (!$signature || !$deviceId) {
            // Pour le dev, on peut désactiver la vérification
            if (config('app.env') !== 'local') {
                abort(403, 'Signature ou Device ID manquant');
            }
            return;
        }

        $payload = $request->getContent();
        $expectedSignature = hash_hmac('sha256', $payload . $deviceId, $secret);

        if (!hash_equals($expectedSignature, $signature)) {
            Log::warning('Signature HMAC invalide pour la synchro mobile', ['device' => $deviceId]);
            if (config('app.env') !== 'local') {
                abort(403, 'Signature invalide');
            }
        }
    }
}
