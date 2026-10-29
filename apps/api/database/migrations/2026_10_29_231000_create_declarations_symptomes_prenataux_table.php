<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('declarations_symptomes_prenataux', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('grossesse_id');
            $table->uuid('contact_prenatal_id')->nullable();
            $table->uuid('centre_sante_id');
            $table->uuid('auteur_id')->nullable();

            $table->string('code_symptome', 80);
            $table->string('libelle_symptome', 180);
            $table->string('statut_declaration', 24);
            $table->string('source_declaration', 40);
            $table->timestampTz('declare_le');
            $table->timestampTz('debut_estime_le')->nullable();
            $table->unsignedTinyInteger('intensite_declaree')->nullable();
            $table->string('precision', 180)->nullable();
            $table->text('observations')->nullable();
            $table->string('statut_validation', 24)->default('A_VERIFIER');
            $table->timestampsTz();

            $table->foreign('grossesse_id')
                ->references('id')->on('grossesses')->restrictOnDelete();
            $table->foreign('contact_prenatal_id')
                ->references('id')->on('contacts_prenataux')->nullOnDelete();
            $table->foreign('centre_sante_id')
                ->references('centreId')->on('CentreSante')->restrictOnDelete();

            $table->index(['grossesse_id', 'declare_le']);
            $table->index(['centre_sante_id', 'statut_declaration']);
            $table->index(['grossesse_id', 'code_symptome']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('declarations_symptomes_prenataux');
    }
};
