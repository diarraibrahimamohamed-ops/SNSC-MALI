<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('enfant_tuteurs', function (Blueprint $table) {
            $table->uuid('enfant_id');
            $table->uuid('tuteur_id');
            $table->string('type_relation')->nullable();
            $table->boolean('est_principal')->default(false);

            $table->primary(['enfant_id', 'tuteur_id']);
            $table->foreign('enfant_id')->references('id')->on('enfants')->cascadeOnDelete();
            $table->foreign('tuteur_id')->references('id')->on('tuteurs')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enfant_tuteurs');
    }
};
