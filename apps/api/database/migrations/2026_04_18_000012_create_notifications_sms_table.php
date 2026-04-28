<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('notifications_sms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('rendez_vous_id')->nullable();
            $table->uuid('enfant_id');
            $table->uuid('tuteur_id')->nullable();
            $table->uuid('score_risque_id')->nullable();
            $table->string('numero_telephone');
            $table->text('contenu_message');
            $table->string('statut_livraison')->default('EN_ATTENTE');
            $table->timestamp('envoye_le')->nullable();
            $table->string('id_message_fournisseur')->nullable();

            $table->foreign('rendez_vous_id')->references('id')->on('rendez_vous')->nullOnDelete();
            $table->foreign('enfant_id')->references('id')->on('enfants')->cascadeOnDelete();
            $table->foreign('tuteur_id')->references('id')->on('tuteurs')->nullOnDelete();
            $table->foreign('score_risque_id')->references('id')->on('scores_risque')->nullOnDelete();

            $table->index(['numero_telephone', 'statut_livraison']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications_sms');
    }
};
