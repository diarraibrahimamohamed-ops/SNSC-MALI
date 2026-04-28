<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('centres_sante', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nom');
            $table->string('code_zone')->nullable();
            $table->string('adresse')->nullable();
            $table->integer('capacite')->nullable();
            $table->timestamp('cree_le')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('centres_sante');
    }
};
