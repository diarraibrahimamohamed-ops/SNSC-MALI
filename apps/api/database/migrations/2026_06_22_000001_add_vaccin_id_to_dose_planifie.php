<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('DosePlanifie', function (Blueprint $table) {
            $table->uuid('vaccinId')->nullable()->after('calendrierId');
            $table->foreign('vaccinId')->references('vaccinId')->on('Vaccin')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('DosePlanifie', function (Blueprint $table) {
            $table->dropForeign(['vaccinId']);
            $table->dropColumn('vaccinId');
        });
    }
};
