<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('scores_risque', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('enfant_id');
            $table->uuid('rendez_vous_id')->nullable();
            $table->string('version_modele');
            $table->decimal('score', 8, 4);
            $table->string('niveau_risque');
            $table->decimal('confiance', 8, 4);
            $table->json('facteurs_explicatifs')->nullable();
            $table->timestamp('calcule_le')->useCurrent();

            $table->foreign('enfant_id')->references('id')->on('enfants')->cascadeOnDelete();
            $table->foreign('rendez_vous_id')->references('id')->on('rendez_vous')->nullOnDelete();

            $table->index(['enfant_id', 'niveau_risque']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scores_risque');
    }
};
