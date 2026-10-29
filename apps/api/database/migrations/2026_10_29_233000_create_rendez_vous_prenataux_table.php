<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rendez_vous_prenataux', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('grossesse_id');
            $table->uuid('centre_sante_id');
            $table->uuid('contact_prenatal_id')->nullable();
            $table->uuid('auteur_id')->nullable();

            $table->date('prevu_le');
            $table->string('type_rendez_vous', 32);
            $table->string('libelle', 180);
            $table->string('statut', 24)->default('PLANIFIE');
            $table->timestampTz('realise_le')->nullable();
            $table->text('motif')->nullable();
            $table->uuid('remplace_rendez_vous_id')->nullable();

            // A reminder is sent only when an explicit active SMS_RENDEZ_VOUS consent exists.
            $table->timestampTz('rappel_programme_le')->nullable();
            $table->string('rappel_statut', 40)->default('NON_DEMANDE');
            $table->timestampTz('rappel_envoye_le')->nullable();
            $table->unsignedSmallInteger('rappel_tentatives')->default(0);
            $table->string('rappel_erreur_code', 80)->nullable();

            $table->timestampsTz();

            $table->foreign('grossesse_id')
                ->references('id')->on('grossesses')->restrictOnDelete();
            $table->foreign('centre_sante_id')
                ->references('centreId')->on('CentreSante')->restrictOnDelete();
            $table->foreign('contact_prenatal_id')
                ->references('id')->on('contacts_prenataux')->nullOnDelete();
            $table->foreign('remplace_rendez_vous_id')
                ->references('id')->on('rendez_vous_prenataux')->nullOnDelete();

            $table->index(['centre_sante_id', 'statut', 'prevu_le']);
            $table->index(['grossesse_id', 'prevu_le']);
            $table->index(['rappel_statut', 'rappel_programme_le']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rendez_vous_prenataux');
    }
};
