<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('DossierEnfant', function (Blueprint $table) {
            $table->string('nom', 255)->nullable()->after('identifiantSanitaire');
            $table->string('prenom', 255)->nullable()->after('nom');
        });
    }

    public function down(): void
    {
        Schema::table('DossierEnfant', function (Blueprint $table) {
            $table->dropColumn(['nom', 'prenom']);
        });
    }
};
