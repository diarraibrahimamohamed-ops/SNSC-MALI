<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('file_synchronisation', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('id_appareil');
            $table->string('type_agregat');
            $table->uuid('id_agregat')->nullable();
            $table->string('type_operation');
            $table->json('charge_utile')->nullable();
            $table->string('statut_sync')->default('EN_ATTENTE');
            $table->text('derniere_erreur')->nullable();
            $table->timestamp('cree_le')->useCurrent();
            $table->timestamp('synchronise_le')->nullable();

            $table->index(['statut_sync', 'cree_le']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_synchronisation');
    }
};
