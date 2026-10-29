<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referentiels_examens_prenataux', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('version_protocole', 100);
            $table->string('code_examen', 80);
            $table->string('nom_examen', 180);
            $table->string('categorie', 80);
            $table->string('modalite', 24);
            $table->unsignedTinyInteger('semaine_min')->nullable();
            $table->unsignedTinyInteger('semaine_max')->nullable();
            $table->string('source_reference', 255);
            $table->uuid('auteur_id')->nullable();
            $table->timestampsTz();

            $table->unique(['version_protocole', 'code_examen'], 'referentiel_examen_version_code_unique');
            $table->index(['version_protocole', 'semaine_min', 'semaine_max']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referentiels_examens_prenataux');
    }
};
