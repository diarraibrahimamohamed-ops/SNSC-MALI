<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tuteurs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nom_complet');
            $table->string('telephone');
            $table->string('adresse')->nullable();
            $table->boolean('consentement_donne')->default(false);
            $table->timestamp('cree_le')->useCurrent();

            $table->index('telephone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tuteurs');
    }
};
