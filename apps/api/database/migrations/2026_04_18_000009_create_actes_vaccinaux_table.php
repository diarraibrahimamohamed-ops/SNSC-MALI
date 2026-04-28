<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('actes_vaccinaux', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('enfant_id');
            $table->uuid('vaccin_id');
            $table->uuid('dose_calendrier_enfant_id')->nullable();
            $table->uuid('agent_id');
            $table->uuid('centre_sante_id');
            $table->timestamp('administre_le');
            $table->string('numero_lot')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('cree_le')->useCurrent();

            $table->foreign('enfant_id')->references('id')->on('enfants')->cascadeOnDelete();
            $table->foreign('vaccin_id')->references('id')->on('vaccins')->restrictOnDelete();
            $table->foreign('dose_calendrier_enfant_id')->references('id')->on('doses_calendrier_enfant')->nullOnDelete();
            $table->foreign('agent_id')->references('id')->on('agents')->restrictOnDelete();
            $table->foreign('centre_sante_id')->references('id')->on('centres_sante')->restrictOnDelete();

            $table->index(['enfant_id', 'administre_le']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actes_vaccinaux');
    }
};
