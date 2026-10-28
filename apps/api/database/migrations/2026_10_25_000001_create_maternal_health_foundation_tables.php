<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personnes_meres', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('identifiant_sanitaire', 100)->nullable()->unique();
            $table->string('nom', 100);
            $table->string('prenom', 100)->nullable();
            $table->date('date_naissance')->nullable();
            $table->string('telephone', 30)->nullable();
            $table->string('langue_preferee', 20)->nullable();
            $table->uuid('centre_sante_id');
            $table->string('source_donnee', 100)->default('SAISIE_AGENT');
            $table->timestamp('collecte_le')->nullable();
            $table->uuid('auteur_id')->nullable();
            $table->string('statut', 30)->default('ACTIF');
            $table->timestamp('archive_le')->nullable();
            $table->timestamps();

            $table->foreign('centre_sante_id')->references('centreId')->on('CentreSante')->restrictOnDelete();
            $table->index(['centre_sante_id', 'nom', 'prenom']);
        });

        Schema::create('grossesses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mere_id');
            $table->date('date_debut_estimee');
            $table->date('terme_estime')->nullable();
            $table->unsignedTinyInteger('nombre_foetus')->default(1);
            $table->string('statut', 30)->default('SUIVI');
            $table->uuid('centre_sante_id');
            $table->string('version_protocole', 100)->nullable();
            $table->string('source_donnee', 100)->default('SAISIE_AGENT');
            $table->timestamp('date_source')->nullable();
            $table->uuid('auteur_id')->nullable();
            $table->string('statut_validation', 30)->default('A_VERIFIER');
            $table->timestamp('archive_le')->nullable();
            $table->timestamps();

            $table->foreign('mere_id')->references('id')->on('personnes_meres')->restrictOnDelete();
            $table->foreign('centre_sante_id')->references('centreId')->on('CentreSante')->restrictOnDelete();
            $table->index(['mere_id', 'statut']);
            $table->index(['centre_sante_id', 'terme_estime']);
        });

        Schema::create('liens_mere_enfant', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mere_id');
            $table->uuid('enfant_id');
            $table->string('type_lien', 30)->default('BIOLOGIQUE');
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->string('statut_verification', 30)->default('A_VERIFIER');
            $table->string('source_donnee', 100)->default('SAISIE_AGENT');
            $table->uuid('auteur_id')->nullable();
            $table->timestamps();

            $table->foreign('mere_id')->references('id')->on('personnes_meres')->restrictOnDelete();
            $table->foreign('enfant_id')->references('enfantId')->on('DossierEnfant')->restrictOnDelete();
            $table->unique(['mere_id', 'enfant_id', 'type_lien'], 'liens_mere_enfant_unique');
            $table->index('enfant_id');
        });

        Schema::create('contacts_prenataux', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('grossesse_id');
            $table->timestamp('contact_le');
            $table->string('type_contact', 40);
            $table->unsignedTinyInteger('age_gestationnel_semaines')->nullable();
            $table->uuid('centre_sante_id');
            $table->uuid('auteur_id')->nullable();
            $table->json('observations')->nullable();
            $table->string('prochaine_etape', 255)->nullable();
            $table->date('prochain_rendez_vous_le')->nullable();
            $table->string('version_protocole', 100)->nullable();
            $table->string('source_donnee', 100)->default('SAISIE_AGENT');
            $table->string('statut_validation', 30)->default('A_VERIFIER');
            $table->timestamps();

            $table->foreign('grossesse_id')->references('id')->on('grossesses')->restrictOnDelete();
            $table->foreign('centre_sante_id')->references('centreId')->on('CentreSante')->restrictOnDelete();
            $table->index(['grossesse_id', 'contact_le']);
        });

        Schema::create('mesures_cliniques', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('grossesse_id');
            $table->string('type_mesure', 100);
            $table->decimal('valeur', 12, 3)->nullable();
            $table->string('unite', 30);
            $table->timestamp('mesuree_le');
            $table->string('methode', 100)->nullable();
            $table->uuid('auteur_id')->nullable();
            $table->string('source_donnee', 100)->default('SAISIE_AGENT');
            $table->string('statut_validation', 30)->default('A_VERIFIER');
            $table->timestamps();

            $table->foreign('grossesse_id')->references('id')->on('grossesses')->restrictOnDelete();
            $table->index(['grossesse_id', 'type_mesure', 'mesuree_le']);
        });

        Schema::create('episodes_accouchement', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('grossesse_id')->unique();
            $table->timestamp('accouchement_le');
            $table->uuid('centre_sante_id');
            $table->string('type_accouchement', 50)->nullable();
            $table->string('issue', 50);
            $table->json('complications')->nullable();
            $table->uuid('auteur_id')->nullable();
            $table->string('source_donnee', 100)->default('SAISIE_AGENT');
            $table->string('statut_validation', 30)->default('A_VERIFIER');
            $table->timestamps();

            $table->foreign('grossesse_id')->references('id')->on('grossesses')->restrictOnDelete();
            $table->foreign('centre_sante_id')->references('centreId')->on('CentreSante')->restrictOnDelete();
            $table->index(['centre_sante_id', 'accouchement_le']);
        });

        Schema::create('suivis_postpartum', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mere_id');
            $table->uuid('accouchement_id')->nullable();
            $table->timestamp('suivi_le');
            $table->string('type_contact', 40);
            $table->json('observations')->nullable();
            $table->string('orientation', 255)->nullable();
            $table->date('prochain_rendez_vous_le')->nullable();
            $table->uuid('centre_sante_id');
            $table->uuid('auteur_id')->nullable();
            $table->string('source_donnee', 100)->default('SAISIE_AGENT');
            $table->string('statut_validation', 30)->default('A_VERIFIER');
            $table->timestamps();

            $table->foreign('mere_id')->references('id')->on('personnes_meres')->restrictOnDelete();
            $table->foreign('accouchement_id')->references('id')->on('episodes_accouchement')->restrictOnDelete();
            $table->foreign('centre_sante_id')->references('centreId')->on('CentreSante')->restrictOnDelete();
            $table->index(['mere_id', 'suivi_le']);
        });

        Schema::create('references_soins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('patient_type', 40);
            $table->uuid('patient_id');
            $table->uuid('grossesse_id')->nullable();
            $table->uuid('centre_emetteur_id');
            $table->uuid('centre_destinataire_id');
            $table->string('motif_code', 100);
            $table->string('priorite', 20);
            $table->string('statut', 40)->default('CREEE');
            $table->timestamp('cree_le');
            $table->timestamp('envoyee_le')->nullable();
            $table->timestamp('receptionnee_le')->nullable();
            $table->timestamp('prise_en_charge_le')->nullable();
            $table->timestamp('cloturee_le')->nullable();
            $table->string('transport', 100)->nullable();
            $table->uuid('responsable_suivi_id')->nullable();
            $table->text('note_issue')->nullable();
            $table->timestamps();

            $table->foreign('grossesse_id')->references('id')->on('grossesses')->restrictOnDelete();
            $table->foreign('centre_emetteur_id')->references('centreId')->on('CentreSante')->restrictOnDelete();
            $table->foreign('centre_destinataire_id')->references('centreId')->on('CentreSante')->restrictOnDelete();
            $table->index(['centre_emetteur_id', 'statut']);
            $table->index(['centre_destinataire_id', 'statut']);
            $table->index(['patient_type', 'patient_id']);
        });

        Schema::create('consentements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('sujet_type', 40);
            $table->uuid('sujet_id');
            $table->string('finalite', 100);
            $table->string('version_notice', 100);
            $table->string('canal', 40);
            $table->string('statut', 20)->default('ACTIF');
            $table->timestamp('consenti_le');
            $table->timestamp('retire_le')->nullable();
            $table->uuid('representant_autorise_id')->nullable();
            $table->uuid('centre_sante_id');
            $table->uuid('auteur_id')->nullable();
            $table->timestamps();

            $table->foreign('centre_sante_id')->references('centreId')->on('CentreSante')->restrictOnDelete();
            $table->index(['sujet_type', 'sujet_id', 'finalite', 'statut']);
        });

        Schema::create('evenements_synchronisation', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_id')->unique();
            $table->string('idempotency_key', 120)->unique();
            $table->string('device_id', 120);
            $table->string('schema_version', 30);
            $table->string('type_evenement', 100);
            $table->string('type_agregat', 100);
            $table->uuid('id_agregat');
            $table->timestamp('cree_localement_le');
            $table->timestamp('recu_serveur_le')->nullable();
            $table->string('statut', 30)->default('RECU');
            $table->string('erreur_code', 100)->nullable();
            $table->text('erreur_detail')->nullable();
            $table->string('resolution_conflit', 100)->nullable();
            $table->string('charge_utile_hash', 64);
            $table->uuid('centre_sante_id')->nullable();
            $table->uuid('auteur_id')->nullable();
            $table->timestamps();

            $table->foreign('centre_sante_id')->references('centreId')->on('CentreSante')->nullOnDelete();
            $table->index(['centre_sante_id', 'statut', 'recu_serveur_le']);
        });

        Schema::create('journal_audit_clinique', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('acteur_id')->nullable();
            $table->string('action', 120);
            $table->string('sujet_type', 80);
            $table->uuid('sujet_id');
            $table->uuid('centre_sante_id')->nullable();
            $table->string('resultat', 30);
            $table->string('correlation_id', 100)->nullable();
            $table->json('metadonnees_minimales')->nullable();
            $table->timestamp('survenu_le');

            $table->foreign('centre_sante_id')->references('centreId')->on('CentreSante')->nullOnDelete();
            $table->index(['sujet_type', 'sujet_id', 'survenu_le']);
            $table->index(['centre_sante_id', 'survenu_le']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_audit_clinique');
        Schema::dropIfExists('evenements_synchronisation');
        Schema::dropIfExists('consentements');
        Schema::dropIfExists('references_soins');
        Schema::dropIfExists('suivis_postpartum');
        Schema::dropIfExists('episodes_accouchement');
        Schema::dropIfExists('mesures_cliniques');
        Schema::dropIfExists('contacts_prenataux');
        Schema::dropIfExists('liens_mere_enfant');
        Schema::dropIfExists('grossesses');
        Schema::dropIfExists('personnes_meres');
    }
};
