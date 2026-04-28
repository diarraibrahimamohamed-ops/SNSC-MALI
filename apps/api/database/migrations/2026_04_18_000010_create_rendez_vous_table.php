<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('enfant_id');
            $table->uuid('dose_calendrier_enfant_id')->nullable();

            $table->date('date_cible');
            $table->string('statut')->default('PLANIFIE');
            $table->integer('nombre_rappels')->default(0);
            $table->string('canal')->nullable();
            $table->string('raison_absence')->nullable();

            // self reference (sans contrainte ici)
            $table->uuid('reprogramme_depuis_id')->nullable();

            $table->timestamp('cree_le')->useCurrent();

            $table->foreign('enfant_id')
                ->references('id')
                ->on('enfants')
                ->cascadeOnDelete();

            $table->foreign('dose_calendrier_enfant_id')
                ->references('id')
                ->on('doses_calendrier_enfant')
                ->nullOnDelete();

            $table->index(['date_cible', 'statut']);
        });

        //  CONTRAINTES AJOUTÉES APRÈS CRÉATION (IMPORTANT)
        Schema::table('rendez_vous', function (Blueprint $table) {
            $table->foreign('reprogramme_depuis_id')
                ->references('id')
                ->on('rendez_vous')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('rendez_vous', function (Blueprint $table) {
            $table->dropForeign(['reprogramme_depuis_id']);
        });

        Schema::dropIfExists('rendez_vous');
    }
};