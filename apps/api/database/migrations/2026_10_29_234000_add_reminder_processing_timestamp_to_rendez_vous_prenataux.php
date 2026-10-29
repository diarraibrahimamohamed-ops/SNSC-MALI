<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rendez_vous_prenataux', function (Blueprint $table) {
            $table->timestampTz('rappel_debut_traitement_le')->nullable()->after('rappel_statut');
        });
    }

    public function down(): void
    {
        Schema::table('rendez_vous_prenataux', function (Blueprint $table) {
            $table->dropColumn('rappel_debut_traitement_le');
        });
    }
};
