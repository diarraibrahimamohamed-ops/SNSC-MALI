<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Tuteur', function (Blueprint $table) {
            $table->uuid('tuteurId')->primary();
            $table->string('nomComplet', 255);
            $table->string('telephone', 30);
        });

        Schema::create('CentreSante', function (Blueprint $table) {
            $table->uuid('centreId')->primary();
            $table->string('nom', 255);
            $table->string('zoneSanitaire', 255);
        });

        Schema::create('DossierEnfant', function (Blueprint $table) {
            $table->uuid('enfantId')->primary();
            $table->string('identifiantSanitaire', 100);
            $table->dateTime('dateNaissance');
            $table->string('sexe', 20);
            $table->uuid('tuteurId');
            $table->uuid('centreId');

            $table->foreign('tuteurId')->references('tuteurId')->on('Tuteur')->onDelete('cascade');
            $table->foreign('centreId')->references('centreId')->on('CentreSante')->onDelete('cascade');
        });

        Schema::create('Vaccin', function (Blueprint $table) {
            $table->uuid('vaccinId')->primary();
            $table->string('libelle', 255);
            $table->string('code', 50);
        });

        Schema::create('StatutVaccinal', function (Blueprint $table) {
            $table->string('code', 50)->primary();
            $table->string('libelle', 255);
        });

        Schema::create('AgentSante', function (Blueprint $table) {
            $table->uuid('agentId')->primary();
            $table->string('nom', 255);
            $table->string('matricule', 100)->unique();
            $table->string('password'); // Required for Laravel Auth to work
            $table->uuid('centreId')->nullable(); // Foreign key to centre (needed for the frontend logic previously established)
            $table->string('role', 50)->default('AGENT'); // Required for Auth
            $table->foreign('centreId')->references('centreId')->on('CentreSante')->onDelete('cascade');
        });

        Schema::create('ActeVaccinal', function (Blueprint $table) {
            $table->uuid('acteId')->primary();
            $table->dateTime('dateActe');
            $table->string('lotVaccin', 100)->nullable();
            $table->uuid('enfantId');
            $table->uuid('vaccinId');
            $table->string('statutCode', 50);
            $table->uuid('agentId');

            $table->foreign('enfantId')->references('enfantId')->on('DossierEnfant')->onDelete('cascade');
            $table->foreign('vaccinId')->references('vaccinId')->on('Vaccin')->onDelete('cascade');
            $table->foreign('statutCode')->references('code')->on('StatutVaccinal')->onDelete('cascade');
            $table->foreign('agentId')->references('agentId')->on('AgentSante')->onDelete('cascade');
        });

        Schema::create('CalendrierVaccinal', function (Blueprint $table) {
            $table->uuid('calendrierId')->primary();
            $table->dateTime('dateCreation');
            $table->uuid('enfantId');

            $table->foreign('enfantId')->references('enfantId')->on('DossierEnfant')->onDelete('cascade');
        });

        Schema::create('DosePlanifie', function (Blueprint $table) {
            $table->uuid('doseId')->primary();
            $table->dateTime('datePrevue');
            $table->dateTime('dateAdministration')->nullable();
            $table->uuid('calendrierId');

            $table->foreign('calendrierId')->references('calendrierId')->on('CalendrierVaccinal')->onDelete('cascade');
        });

        Schema::create('JournalAudit', function (Blueprint $table) {
            $table->uuid('auditId')->primary();
            $table->string('action', 255);
            $table->dateTime('horodatage');
            $table->uuid('enfantId');

            $table->foreign('enfantId')->references('enfantId')->on('DossierEnfant')->onDelete('cascade');
        });

        Schema::create('NiveauRisque', function (Blueprint $table) {
            $table->string('code', 50)->primary();
            $table->string('libelle', 255);
        });

        Schema::create('ScoreRisqueVaccinal', function (Blueprint $table) {
            $table->uuid('scoreId')->primary();
            $table->decimal('score', 5, 2);
            $table->decimal('confiance', 5, 2);
            $table->string('versionModele', 100);
            $table->dateTime('dateCalcul');
            $table->uuid('enfantId');
            $table->string('niveauCode', 50);

            $table->foreign('enfantId')->references('enfantId')->on('DossierEnfant')->onDelete('cascade');
            $table->foreign('niveauCode')->references('code')->on('NiveauRisque')->onDelete('cascade');
        });

        Schema::create('RendezVousVaccinal', function (Blueprint $table) {
            $table->uuid('rdvId')->primary();
            $table->dateTime('datePrevue');
            $table->dateTime('dateRelancePrevue')->nullable();
            $table->uuid('enfantId');
            $table->uuid('doseId');

            $table->foreign('enfantId')->references('enfantId')->on('DossierEnfant')->onDelete('cascade');
            $table->foreign('doseId')->references('doseId')->on('DosePlanifie')->onDelete('cascade');
        });

        Schema::create('NotificationSMS', function (Blueprint $table) {
            $table->uuid('notificationId')->primary();
            $table->dateTime('dateEnvoi')->nullable();
            $table->string('statutLivraison', 50);
            $table->uuid('rdvId');

            $table->foreign('rdvId')->references('rdvId')->on('RendezVousVaccinal')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('NotificationSMS');
        Schema::dropIfExists('RendezVousVaccinal');
        Schema::dropIfExists('ScoreRisqueVaccinal');
        Schema::dropIfExists('NiveauRisque');
        Schema::dropIfExists('JournalAudit');
        Schema::dropIfExists('DosePlanifie');
        Schema::dropIfExists('CalendrierVaccinal');
        Schema::dropIfExists('ActeVaccinal');
        Schema::dropIfExists('AgentSante');
        Schema::dropIfExists('StatutVaccinal');
        Schema::dropIfExists('Vaccin');
        Schema::dropIfExists('DossierEnfant');
        Schema::dropIfExists('CentreSante');
        Schema::dropIfExists('Tuteur');
    }
};
