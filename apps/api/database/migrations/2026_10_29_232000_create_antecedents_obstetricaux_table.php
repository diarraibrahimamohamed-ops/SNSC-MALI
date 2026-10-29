<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('antecedents_obstetricaux', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mere_id');
            $table->uuid('centre_sante_id');
            $table->uuid('auteur_id')->nullable();

            $table->string('code_antecedent', 80);
            $table->date('date_evenement')->nullable();
            $table->string('source_declaration', 40);
            $table->text('precision')->nullable();
            $table->text('observations')->nullable();
            $table->string('statut_validation', 24)->default('A_VERIFIER');
            $table->timestampsTz();

            $table->foreign('mere_id')
                ->references('id')->on('personnes_meres')->restrictOnDelete();
            $table->foreign('centre_sante_id')
                ->references('centreId')->on('CentreSante')->restrictOnDelete();

            $table->index(['mere_id', 'date_evenement']);
            $table->index(['centre_sante_id', 'code_antecedent']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('antecedents_obstetricaux');
    }
};
