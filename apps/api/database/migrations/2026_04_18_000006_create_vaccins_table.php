<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vaccins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('nom');
            $table->string('maladie_cible')->nullable();
            $table->boolean('est_actif')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaccins');
    }
};
