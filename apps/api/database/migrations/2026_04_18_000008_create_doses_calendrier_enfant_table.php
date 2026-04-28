<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('doses_calendrier_enfant', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('enfant_id');
            $table->uuid('modele_calendrier_id');
            $table->string('statut')->default('PREVUE');
            $table->date('date_echeance')->nullable();
            $table->date('debut_fenetre')->nullable();
            $table->date('fin_fenetre')->nullable();
            $table->timestamp('administree_le')->nullable();
            $table->timestamp('retard_detecte_le')->nullable();

            $table->foreign('enfant_id')->references('id')->on('enfants')->cascadeOnDelete();
            $table->foreign('modele_calendrier_id')->references('id')->on('modeles_calendrier')->cascadeOnDelete();
            $table->index(['enfant_id', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doses_calendrier_enfant');
    }
};
