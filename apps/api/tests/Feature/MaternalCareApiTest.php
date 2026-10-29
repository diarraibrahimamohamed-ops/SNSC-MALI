<?php

namespace Tests\Feature;

use App\Models\AgentSante;
use App\Models\CentreSante;
use App\Models\EpisodeAccouchement;
use App\Models\EvenementSynchronisation;
use App\Models\PersonneMere;
use App\Models\SuiviPostPartum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class MaternalCareApiTest extends TestCase
{
    use RefreshDatabase;

    private CentreSante $centreA;
    private CentreSante $centreB;
    private AgentSante $agentA;
    private AgentSante $agentB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->centreA = $this->centre('CSCOM A');
        $this->centreB = $this->centre('CSREF B');
        $this->agentA = $this->agent($this->centreA, 'AGT-MAT-A');
        $this->agentB = $this->agent($this->centreB, 'AGT-MAT-B');
    }

    public function test_parcours_mere_grossesse_contact_est_isole_par_structure(): void
    {
        $mereResponse = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/meres', [
            'nom' => 'Traore',
            'prenom' => 'Aminata',
            'identifiant_sanitaire' => 'MERE-001',
            'langue_preferee' => 'bm',
        ]);
        $mereResponse->assertCreated();
        $mereId = $mereResponse->json('data.id');

        $grossesseResponse = $this->actingAs($this->agentA, 'api')->postJson("/api/v1/meres/{$mereId}/grossesses", [
            'date_debut_estimee' => now()->subMonths(4)->toDateString(),
            'terme_estime' => now()->addMonths(5)->toDateString(),
            'nombre_foetus' => 1,
            'version_protocole' => 'A_VALIDER',
        ]);
        $grossesseResponse->assertCreated();
        $grossesseId = $grossesseResponse->json('data.id');

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/grossesses/{$grossesseId}/contacts", [
            'contact_le' => now()->subHour()->toIso8601String(),
            'type_contact' => 'CPN',
            'age_gestationnel_semaines' => 18,
            'prochaine_etape' => 'Rendez-vous à confirmer selon protocole validé.',
            'prochain_rendez_vous_le' => now()->addDays(7)->toDateString(),
        ])->assertCreated()
            ->assertJsonPath('data.prochain_rendez_vous_le', now()->addDays(7)->toDateString());

        $this->actingAs($this->agentA, 'api')->getJson("/api/v1/meres/{$mereId}/chronologie")
            ->assertOk()
            ->assertJsonFragment(['type' => 'CONTACT_PRENATAL']);

        $response = $this->actingAs($this->agentB, 'api')->getJson("/api/v1/meres/{$mereId}");
        $this->assertSame(403, $response->status(), $response->getContent());
    }

    public function test_reference_suit_les_transitions_controlees(): void
    {
        $mere = PersonneMere::create([
            'id' => (string) Str::uuid(),
            'nom' => 'Diallo',
            'centre_sante_id' => $this->centreA->centreId,
            'source_donnee' => 'TEST',
            'collecte_le' => now(),
            'auteur_id' => $this->agentA->agentId,
        ]);

        $creation = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/references', [
            'patient_type' => 'MERE',
            'patient_id' => $mere->id,
            'centre_destinataire_id' => $this->centreB->centreId,
            'motif_code' => 'EVALUATION_CLINIQUE',
            'priorite' => 'URGENTE',
        ]);
        $creation->assertCreated()->assertJsonPath('data.statut', 'CREEE');
        $referenceId = $creation->json('data.id');

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/references/{$referenceId}/envoyer")
            ->assertOk()->assertJsonPath('data.statut', 'ENVOYEE');
        $this->actingAs($this->agentB, 'api')->postJson("/api/v1/references/{$referenceId}/accuse-reception")
            ->assertOk()->assertJsonPath('data.statut', 'RECUE');
        $this->actingAs($this->agentB, 'api')->patchJson("/api/v1/references/{$referenceId}/issue", ['statut' => 'PRISE_EN_CHARGE_CONFIRMEE'])
            ->assertOk()->assertJsonPath('data.statut', 'PRISE_EN_CHARGE_CONFIRMEE');
    }

    public function test_sync_replay_is_idempotent(): void
    {
        $eventId = (string) Str::uuid();
        $payload = [
            'device_id' => 'android-test-01',
            'events' => [[
                'event_id' => $eventId,
                'idempotency_key' => 'android-test-01:1',
                'schema_version' => '1.0',
                'type' => 'mere.creee',
                'aggregate_type' => 'PersonneMere',
                'aggregate_id' => (string) Str::uuid(),
                'occurred_at' => now()->subMinute()->toIso8601String(),
                'payload' => ['hash_only' => true],
                'centre_sante_id' => $this->centreA->centreId,
            ]],
        ];

        $this->actingAs($this->agentA, 'api')->postJson('/api/v1/mobile/sync', $payload)
            ->assertOk()->assertJsonPath('data.0.statut', 'RECU_A_TRAITER')
            ->assertJsonPath('data.0.traitement', 'JOURNAL_SEULEMENT');
        $this->actingAs($this->agentA, 'api')->postJson('/api/v1/mobile/sync', $payload)
            ->assertOk()->assertJsonPath('data.0.statut', 'DEJA_RECU')
            ->assertJsonPath('data.0.traitement', 'JOURNAL_SEULEMENT');

        $this->assertSame(1, EvenementSynchronisation::count());
    }

    public function test_mesures_cliniques_sont_enregistre_es_et_isolees_par_structure(): void
    {
        $mere = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/meres', [
            'nom' => 'Coulibaly',
            'prenom' => 'Awa',
            'identifiant_sanitaire' => 'MERE-MESURE-001',
        ])->assertCreated()->json('data.id');

        $grossesse = $this->actingAs($this->agentA, 'api')->postJson("/api/v1/meres/{$mere}/grossesses", [
            'date_debut_estimee' => now()->subMonths(3)->toDateString(),
            'terme_estime' => now()->addMonths(6)->toDateString(),
            'version_protocole' => 'A_VALIDER',
        ])->assertCreated()->json('data.id');

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/grossesses/{$grossesse}/mesures", [
            'type_mesure' => 'TENSION_ARTERIELLE',
            'valeur' => 120,
            'unite' => 'mmHg',
            'mesuree_le' => now()->subMinutes(5)->toIso8601String(),
            'methode' => 'Saisie de test',
        ])->assertCreated()
            ->assertJsonPath('data.statut_validation', 'A_VERIFIER');

        $this->actingAs($this->agentA, 'api')->getJson("/api/v1/grossesses/{$grossesse}/mesures")
            ->assertOk()
            ->assertJsonPath('data.data.0.type_mesure', 'TENSION_ARTERIELLE')
            ->assertJsonPath('data.data.0.unite', 'mmHg');

        $response = $this->actingAs($this->agentB, 'api')->getJson("/api/v1/grossesses/{$grossesse}/mesures");
        $this->assertSame(403, $response->status(), $response->getContent());
    }

    public function test_un_agent_ne_peut_pas_enregistrer_le_consentement_dune_mere_hors_structure(): void
    {
        $mereHorsCentre = $this->actingAs($this->agentB, 'api')->postJson('/api/v1/meres', [
            'nom' => 'Keita',
            'prenom' => 'Fanta',
            'identifiant_sanitaire' => 'MERE-CONSENT-001',
        ])->assertCreated()->json('data.id');

        $response = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/consentements', [
            'sujet_type' => 'MERE',
            'sujet_id' => $mereHorsCentre,
            'finalite' => 'SMS_RENDEZ_VOUS',
            'version_notice' => '1.0',
            'canal' => 'ECRIT',
            'centre_sante_id' => $this->centreA->centreId,
        ]);
        $this->assertSame(403, $response->status(), $response->getContent());

        $this->assertSame(0, \App\Models\Consentement::count());
    }

    public function test_suivi_postpartum_est_enregistre_et_rejoint_la_chronologie(): void
    {
        $mere = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/meres', [
            'nom' => 'Sangare',
            'prenom' => 'Mariama',
            'identifiant_sanitaire' => 'MERE-POSTPARTUM-001',
        ])->assertCreated()->json('data.id');

        $grossesse = $this->actingAs($this->agentA, 'api')->postJson("/api/v1/meres/{$mere}/grossesses", [
            'date_debut_estimee' => now()->subMonths(9)->toDateString(),
            'terme_estime' => now()->subDay()->toDateString(),
            'nombre_foetus' => 1,
            'version_protocole' => 'A_VALIDER',
        ])->assertCreated()->json('data.id');

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/grossesses/{$grossesse}/accouchement", [
            'accouchement_le' => now()->subDay()->toIso8601String(),
            'type_accouchement' => 'VOIE_BASSE',
            'issue' => 'NAISSANCE_VIVANTE',
        ])->assertCreated();

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/meres/{$mere}/suivis-postpartum", [
            'suivi_le' => now()->toIso8601String(),
            'type_contact' => 'POSTPARTUM_VISITE',
            'observations' => ['resume' => 'Suivi administratif de test, à valider.'],
            'orientation' => 'Suivi à confirmer par le professionnel habilité',
            'prochain_rendez_vous_le' => now()->addDays(7)->toDateString(),
        ])->assertCreated()
            ->assertJsonPath('data.statut_validation', 'A_VERIFIER');

        $this->actingAs($this->agentA, 'api')->getJson("/api/v1/meres/{$mere}/chronologie")
            ->assertOk()
            ->assertJsonFragment(['type' => 'SUIVI_POSTPARTUM']);
    }

    public function test_suivi_postpartum_refuse_un_episode_daccouchement_hors_structure(): void
    {
        $mere = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/meres', [
            'nom' => 'Maiga',
            'prenom' => 'Assetou',
            'identifiant_sanitaire' => 'MERE-POSTPARTUM-002',
        ])->assertCreated()->json('data.id');

        $grossesse = $this->actingAs($this->agentA, 'api')->postJson("/api/v1/meres/{$mere}/grossesses", [
            'date_debut_estimee' => now()->subMonths(9)->toDateString(),
            'terme_estime' => now()->subDay()->toDateString(),
            'nombre_foetus' => 1,
        ])->assertCreated()->json('data.id');

        $episode = EpisodeAccouchement::create([
            'grossesse_id' => $grossesse,
            'accouchement_le' => now()->subDay(),
            'centre_sante_id' => $this->centreB->centreId,
            'type_accouchement' => 'VOIE_BASSE',
            'issue' => 'NAISSANCE_VIVANTE',
            'source_donnee' => 'TEST',
            'statut_validation' => 'A_VERIFIER',
        ]);

        $response = $this->actingAs($this->agentA, 'api')->postJson("/api/v1/meres/{$mere}/suivis-postpartum", [
            'accouchement_id' => $episode->id,
            'suivi_le' => now()->toIso8601String(),
            'type_contact' => 'POSTPARTUM_VISITE',
        ]);

        $this->assertSame(403, $response->status(), $response->getContent());
        $this->assertSame(0, SuiviPostPartum::count());
    }

    public function test_un_evenement_rejoue_avec_un_payload_different_est_signale_comme_conflit(): void
    {
        $eventId = (string) Str::uuid();
        $key = 'android-test-conflict:1';
        $payload = [
            'device_id' => 'android-test-conflict',
            'events' => [[
                'event_id' => $eventId,
                'idempotency_key' => $key,
                'schema_version' => '1.0',
                'type' => 'mere.creee',
                'aggregate_type' => 'PersonneMere',
                'aggregate_id' => (string) Str::uuid(),
                'occurred_at' => now()->subMinute()->toIso8601String(),
                'payload' => ['nom_hash' => 'first'],
                'centre_sante_id' => $this->centreA->centreId,
            ]],
        ];

        $this->actingAs($this->agentA, 'api')->postJson('/api/v1/mobile/sync', $payload)
            ->assertOk()
            ->assertJsonPath('data.0.statut', 'RECU_A_TRAITER');

        $payload['events'][0]['payload'] = ['nom_hash' => 'different'];

        $this->actingAs($this->agentA, 'api')->postJson('/api/v1/mobile/sync', $payload)
            ->assertOk()
            ->assertJsonPath('data.0.statut', 'CONFLIT')
            ->assertJsonPath('data.0.code', 'CLE_REUTILISEE_AVEC_CONTENU_DIFFERENT');

        $this->assertSame(1, EvenementSynchronisation::count());
    }

    public function test_examens_prenataux_sont_enregistres_et_isoles_par_structure(): void
    {
        $mere = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/meres', [
            'nom' => 'Diarra',
            'prenom' => 'Aminata',
            'identifiant_sanitaire' => 'MERE-EXAMEN-001',
        ])->assertCreated()->json('data.id');

        $grossesse = $this->actingAs($this->agentA, 'api')->postJson("/api/v1/meres/{$mere}/grossesses", [
            'date_debut_estimee' => now()->subMonths(4)->toDateString(),
            'terme_estime' => now()->addMonths(5)->toDateString(),
            'version_protocole' => 'A_VALIDER',
        ])->assertCreated()->json('data.id');

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/grossesses/{$grossesse}/examens", [
            'code_examen' => 'HB',
            'nom_examen' => 'Hémoglobine',
            'categorie' => 'HEMATOLOGIE',
            'statut_resultat' => 'DISPONIBLE',
            'resultat_numerique' => 10.5,
            'unite' => 'g/dL',
            'date_prelevement' => now()->subDay()->toIso8601String(),
            'date_resultat' => now()->subHour()->toIso8601String(),
            'laboratoire' => 'Laboratoire de test',
        ])->assertCreated()
            ->assertJsonPath('data.code_examen', 'HB')
            ->assertJsonPath('data.statut_validation', 'A_VERIFIER');

        $this->actingAs($this->agentA, 'api')->getJson("/api/v1/grossesses/{$grossesse}/examens")
            ->assertOk()
            ->assertJsonPath('data.data.0.code_examen', 'HB')
            ->assertJsonPath('data.data.0.statut_resultat', 'DISPONIBLE');

        $response = $this->actingAs($this->agentB, 'api')->getJson("/api/v1/grossesses/{$grossesse}/examens");
        $this->assertSame(403, $response->status(), $response->getContent());
    }

    public function test_examen_disponible_sans_resultat_ou_avec_dates_incoherentes_est_refuse(): void
    {
        $mere = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/meres', [
            'nom' => 'Traore',
            'prenom' => 'Fatoumata',
            'identifiant_sanitaire' => 'MERE-EXAMEN-002',
        ])->assertCreated()->json('data.id');

        $grossesse = $this->actingAs($this->agentA, 'api')->postJson("/api/v1/meres/{$mere}/grossesses", [
            'date_debut_estimee' => now()->subMonths(2)->toDateString(),
            'terme_estime' => now()->addMonths(7)->toDateString(),
            'version_protocole' => 'A_VALIDER',
        ])->assertCreated()->json('data.id');

        $base = [
            'code_examen' => 'HB',
            'nom_examen' => 'Hémoglobine',
            'categorie' => 'HEMATOLOGIE',
            'statut_resultat' => 'DISPONIBLE',
        ];

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/grossesses/{$grossesse}/examens", $base)
            ->assertUnprocessable();

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/grossesses/{$grossesse}/examens", [
            ...$base,
            'resultat_numerique' => 10.5,
            'unite' => 'g/dL',
            'date_prelevement' => now()->subDays(2)->toIso8601String(),
            'date_resultat' => now()->subDays(3)->toIso8601String(),
        ])->assertUnprocessable();
    }

    public function test_symptomes_prenataux_sont_traces_sans_interpretation_et_isoles_par_structure(): void
    {
        $mere = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/meres', [
            'nom' => 'Cisse',
            'prenom' => 'Aminata',
            'identifiant_sanitaire' => 'MERE-SYMPTOME-001',
        ])->assertCreated()->json('data.id');

        $grossesse = $this->actingAs($this->agentA, 'api')->postJson("/api/v1/meres/{$mere}/grossesses", [
            'date_debut_estimee' => now()->subMonths(3)->toDateString(),
            'terme_estime' => now()->addMonths(6)->toDateString(),
            'version_protocole' => 'A_VALIDER',
        ])->assertCreated()->json('data.id');

        $this->actingAs($this->agentA, 'api')->getJson('/api/v1/catalogues/symptomes-prenataux')
            ->assertOk()
            ->assertJsonFragment(['code' => 'SAIGNEMENTS_VAGINAUX']);

        $declaration = $this->actingAs($this->agentA, 'api')->postJson("/api/v1/grossesses/{$grossesse}/symptomes", [
            'code_symptome' => 'FIEVRE',
            'statut_declaration' => 'SIGNALE',
            'source_declaration' => 'DECLARE_PAR_MERE',
            'declare_le' => now()->subMinutes(10)->toIso8601String(),
            'debut_estime_le' => now()->subHours(2)->toIso8601String(),
            'intensite_declaree' => 4,
            'observations' => 'Déclaration de test uniquement.',
        ])->assertCreated()
            ->assertJsonPath('data.code_symptome', 'FIEVRE')
            ->assertJsonPath('data.statut_declaration', 'SIGNALE')
            ->assertJsonPath('data.statut_validation', 'A_VERIFIER');

        $this->actingAs($this->agentA, 'api')->getJson("/api/v1/grossesses/{$grossesse}/symptomes")
            ->assertOk()
            ->assertJsonPath('data.data.0.id', $declaration->json('data.id'));

        $this->actingAs($this->agentA, 'api')->getJson("/api/v1/meres/{$mere}/chronologie")
            ->assertOk()
            ->assertJsonFragment(['type' => 'SYMPTOME_PRENATAL_DECLARE'])
            ->assertJsonFragment(['libelle' => 'Fièvre déclarée']);

        $response = $this->actingAs($this->agentB, 'api')->getJson("/api/v1/grossesses/{$grossesse}/symptomes");
        $this->assertSame(403, $response->status(), $response->getContent());
    }

    public function test_symptome_refuse_les_dates_incoherentes_et_intensite_non_applicable(): void
    {
        $mere = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/meres', [
            'nom' => 'Sissoko',
            'prenom' => 'Fatou',
            'identifiant_sanitaire' => 'MERE-SYMPTOME-002',
        ])->assertCreated()->json('data.id');

        $grossesse = $this->actingAs($this->agentA, 'api')->postJson("/api/v1/meres/{$mere}/grossesses", [
            'date_debut_estimee' => now()->subMonths(2)->toDateString(),
            'terme_estime' => now()->addMonths(7)->toDateString(),
        ])->assertCreated()->json('data.id');

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/grossesses/{$grossesse}/symptomes", [
            'code_symptome' => 'FIEVRE',
            'statut_declaration' => 'NON_SIGNALE',
            'source_declaration' => 'DECLARE_PAR_MERE',
            'declare_le' => now()->subHour()->toIso8601String(),
            'intensite_declaree' => 3,
        ])->assertUnprocessable();

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/grossesses/{$grossesse}/symptomes", [
            'code_symptome' => 'FIEVRE',
            'statut_declaration' => 'SIGNALE',
            'source_declaration' => 'DECLARE_PAR_MERE',
            'declare_le' => now()->subHours(2)->toIso8601String(),
            'debut_estime_le' => now()->subHour()->toIso8601String(),
        ])->assertUnprocessable();
    }

    public function test_catalogue_mesures_normalise_unites_et_refuse_une_unite_incoherente(): void
    {
        $this->actingAs($this->agentA, 'api')->getJson('/api/v1/catalogues/mesures-cliniques')
            ->assertOk()
            ->assertJsonFragment(['code' => 'POIDS_MATERNEL', 'unite' => 'kg']);

        $mere = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/meres', [
            'nom' => 'Keita',
            'prenom' => 'Awa',
            'identifiant_sanitaire' => 'MERE-MESURE-UNIT-001',
        ])->assertCreated()->json('data.id');

        $grossesse = $this->actingAs($this->agentA, 'api')->postJson("/api/v1/meres/{$mere}/grossesses", [
            'date_debut_estimee' => now()->subMonths(2)->toDateString(),
            'terme_estime' => now()->addMonths(7)->toDateString(),
        ])->assertCreated()->json('data.id');

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/grossesses/{$grossesse}/mesures", [
            'type_mesure' => 'POIDS_MATERNEL',
            'valeur' => 63.2,
            'unite' => 'lb',
            'mesuree_le' => now()->subMinutes(5)->toIso8601String(),
        ])->assertUnprocessable();

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/grossesses/{$grossesse}/mesures", [
            'type_mesure' => 'POIDS_MATERNEL',
            'valeur' => 63.2,
            'unite' => 'kg',
            'mesuree_le' => now()->subMinutes(5)->toIso8601String(),
        ])->assertCreated()
            ->assertJsonPath('data.unite', 'kg');
    }

    public function test_antecedents_obstetricaux_sont_traces_dans_la_chronologie_et_isoles(): void
    {
        $mere = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/meres', [
            'nom' => 'Konate',
            'prenom' => 'Awa',
            'identifiant_sanitaire' => 'MERE-ANTECEDENT-001',
        ])->assertCreated()->json('data.id');

        $this->actingAs($this->agentA, 'api')->getJson('/api/v1/catalogues/antecedents-obstetricaux')
            ->assertOk()
            ->assertJsonFragment(['code' => 'CESARIENNE']);

        $created = $this->actingAs($this->agentA, 'api')->postJson("/api/v1/meres/{$mere}/antecedents-obstetricaux", [
            'code_antecedent' => 'CESARIENNE',
            'date_evenement' => now()->subYears(3)->toDateString(),
            'source_declaration' => 'DECLARE_PAR_MERE',
            'observations' => 'Antécédent déclaré dans un test fonctionnel.',
        ])->assertCreated()
            ->assertJsonPath('data.code_antecedent', 'CESARIENNE')
            ->assertJsonPath('data.statut_validation', 'A_VERIFIER');

        $this->actingAs($this->agentA, 'api')->getJson("/api/v1/meres/{$mere}/antecedents-obstetricaux")
            ->assertOk()
            ->assertJsonPath('data.data.0.id', $created->json('data.id'));

        $this->actingAs($this->agentA, 'api')->getJson("/api/v1/meres/{$mere}/chronologie")
            ->assertOk()
            ->assertJsonFragment(['type' => 'ANTECEDENT_OBSTETRICAL']);

        $response = $this->actingAs($this->agentB, 'api')->getJson("/api/v1/meres/{$mere}/antecedents-obstetricaux");
        $this->assertSame(403, $response->status(), $response->getContent());
    }

    public function test_antecedent_autre_sans_precision_est_refuse(): void
    {
        $mere = $this->actingAs($this->agentA, 'api')->postJson('/api/v1/meres', [
            'nom' => 'Diarra',
            'prenom' => 'Binta',
            'identifiant_sanitaire' => 'MERE-ANTECEDENT-002',
        ])->assertCreated()->json('data.id');

        $this->actingAs($this->agentA, 'api')->postJson("/api/v1/meres/{$mere}/antecedents-obstetricaux", [
            'code_antecedent' => 'AUTRE',
            'source_declaration' => 'INCONNU',
        ])->assertUnprocessable();
    }

    private function centre(string $nom): CentreSante
    {
        return CentreSante::create([
            'centreId' => (string) Str::uuid(),
            'nom' => $nom,
            'zoneSanitaire' => 'Bamako',
        ]);
    }

    private function agent(CentreSante $centre, string $matricule): AgentSante
    {
        return AgentSante::create([
            'agentId' => (string) Str::uuid(),
            'nom' => $matricule,
            'matricule' => $matricule,
            'password' => bcrypt('password'),
            'role' => 'AGENT',
            'centreId' => $centre->centreId,
        ]);
    }
}
