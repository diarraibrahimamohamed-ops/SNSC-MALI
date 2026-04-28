<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('centre_sante_id');
            $table->string('nom_complet');
            $table->string('matricule')->unique();
            $table->string('role');
            $table->string('telephone')->nullable();
            $table->boolean('est_actif')->default(true);
            $table->timestamp('cree_le')->useCurrent();

            $table->foreign('centre_sante_id')->references('id')->on('centres_sante')->restrictOnDelete();
            $table->index('centre_sante_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
