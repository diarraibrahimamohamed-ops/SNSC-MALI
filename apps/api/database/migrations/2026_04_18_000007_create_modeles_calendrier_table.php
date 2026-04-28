<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('modeles_calendrier', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('vaccin_id');
            $table->integer('numero_dose');
            $table->integer('age_min_jours');
            $table->integer('age_recommandee_jours');
            $table->integer('age_max_jours')->nullable();
            $table->boolean('rattrapage_autorise')->default(true);

            $table->foreign('vaccin_id')->references('id')->on('vaccins')->cascadeOnDelete();
            $table->unique(['vaccin_id', 'numero_dose']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modeles_calendrier');
    }
};
