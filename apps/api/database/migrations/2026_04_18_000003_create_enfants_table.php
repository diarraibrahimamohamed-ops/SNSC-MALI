<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('enfants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('identifiant_sanitaire')->unique();
            $table->uuid('tuteur_principal_id')->nullable();
            $table->uuid('centre_sante_id');
            $table->string('prenom');
            $table->integer('age_mois')->nullable();
            $table->date('date_naissance');
            $table->string('sexe', 10);
            $table->string('statut_vaccinal_global')->default('INCONNU');
            $table->text('donnees_chiffrees')->nullable();
            $table->timestamp('cree_le')->useCurrent();

            $table->foreign('tuteur_principal_id')->references('id')->on('tuteurs')->nullOnDelete();
            $table->foreign('centre_sante_id')->references('id')->on('centres_sante')->restrictOnDelete();

            $table->index('centre_sante_id');
            $table->index('tuteur_principal_id');
            $table->index('date_naissance');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enfants');
    }
};
