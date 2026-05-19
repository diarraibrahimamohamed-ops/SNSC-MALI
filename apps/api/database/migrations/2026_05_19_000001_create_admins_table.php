<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nom_complet')->index();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('telephone')->nullable();
            $table->enum('role', ['SUPER_ADMIN', 'ADMIN'])->default('ADMIN');
            $table->boolean('est_actif')->default(true);
            $table->timestamp('dernier_login')->nullable();
            $table->timestamp('cree_le')->useCurrent();
            $table->timestamp('modifie_le')->useCurrent()->useCurrentOnUpdate();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
