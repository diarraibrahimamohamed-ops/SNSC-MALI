<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resultats_examens_prenataux', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('grossesse_id')
                ->constrained('grossesses')
                ->cascadeOnDelete();
            $table->foreignUuid('contact_prenatal_id')
                ->nullable()
                ->constrained('contacts_prenataux')
                ->nullOnDelete();

            // Conserver un périmètre de structure explicite pour l'autorisation.
            $table->uuid('centre_sante_id');
            $table->uuid('auteur_id')->nullable();

            $table->string('code_examen', 80);
            $table->string('nom_examen', 180);
            $table->string('categorie', 80);
            $table->string('statut_resultat', 24)->default('EN_ATTENTE');

            // Un résultat peut être textuel ou numérique; les unités sont explicites.
            $table->text('resultat_texte')->nullable();
            $table->decimal('resultat_numerique', 14, 4)->nullable();
            $table->string('unite', 40)->nullable();
            $table->jsonb('details')->nullable();

            $table->timestampTz('date_prelevement')->nullable();
            $table->timestampTz('date_resultat')->nullable();
            $table->string('laboratoire', 180)->nullable();
            $table->string('source_donnee', 100)->default('SAISIE_AGENT');
            $table->string('version_protocole', 100)->nullable();
            $table->string('statut_validation', 24)->default('A_VERIFIER');
            $table->timestampsTz();

            $table->index(['grossesse_id', 'date_prelevement']);
            $table->index(['centre_sante_id', 'statut_resultat']);
            $table->index('contact_prenatal_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resultats_examens_prenataux');
    }
};
