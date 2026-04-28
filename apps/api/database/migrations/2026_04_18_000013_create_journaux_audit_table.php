<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('journaux_audit', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('agent_id')->nullable();
            $table->string('action');
            $table->string('type_cible');
            $table->uuid('id_cible')->nullable();
            $table->string('resultat');
            $table->json('metadonnees')->nullable();
            $table->timestamp('date_evenement')->useCurrent();

            $table->foreign('agent_id')->references('id')->on('agents')->nullOnDelete();
            $table->index(['type_cible', 'id_cible']);
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journaux_audit');
    }
};
