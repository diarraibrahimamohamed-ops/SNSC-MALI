#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../apps/api"

write_file() {
  local pattern="$1"
  local file
  file="$(find database/migrations -name "*_${pattern}.php" | head -n 1)"
  if [ -z "$file" ]; then
    echo "Migration introuvable: $pattern"
    exit 1
  fi
  cat > "$file"
}

write_file "create_centres_sante_table" <<'PHP'
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
PHP

write_file "create_tuteurs_table" <<'PHP'
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
PHP

write_file "create_enfants_table" <<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('enfants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('identifiant_sanitaire')->unique();
            $table->uuid('tuteur_principal_id')->nullable();
            $table->uuid('centre_sante_id');
            $table->string('prenom');
            $table->integer('age_mois')->nullable();
            $table->date('date_naissance');
            $table->string('sexe', 10);
            $table->string('statut_vaccinal_global')->default('INCONNU');
            $table->text('donnees_chiffrees')->nullable();
            $table->timestamp('cree_le')->useCurrent();

            $table->foreign('tuteur_principal_id')->references('id')->on('tuteurs')->nullOnDelete();
            $table->foreign('centre_sante_id')->references('id')->on('centres_sante')->restrictOnDelete();

            $table->index('centre_sante_id');
            $table->index('tuteur_principal_id');
            $table->index('date_naissance');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enfants');
    }
};
PHP

write_file "create_enfant_tuteurs_table" <<'PHP'
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
PHP

write_file "create_agents_table" <<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('centre_sante_id');
            $table->string('nom_complet');
            $table->string('matricule')->unique();
            $table->string('role');
            $table->string('telephone')->nullable();
            $table->boolean('est_actif')->default(true);
            $table->timestamp('cree_le')->useCurrent();

            $table->foreign('centre_sante_id')->references('id')->on('centres_sante')->restrictOnDelete();
            $table->index('centre_sante_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
PHP

write_file "create_vaccins_table" <<'PHP'
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
PHP

write_file "create_modeles_calendrier_table" <<'PHP'
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
PHP

write_file "create_doses_calendrier_enfant_table" <<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('doses_calendrier_enfant', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('enfant_id');
            $table->uuid('modele_calendrier_id');
            $table->string('statut')->default('PREVUE');
            $table->date('date_echeance')->nullable();
            $table->date('debut_fenetre')->nullable();
            $table->date('fin_fenetre')->nullable();
            $table->timestamp('administree_le')->nullable();
            $table->timestamp('retard_detecte_le')->nullable();

            $table->foreign('enfant_id')->references('id')->on('enfants')->cascadeOnDelete();
            $table->foreign('modele_calendrier_id')->references('id')->on('modeles_calendrier')->cascadeOnDelete();
            $table->index(['enfant_id', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doses_calendrier_enfant');
    }
};
PHP

write_file "create_actes_vaccinaux_table" <<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('actes_vaccinaux', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('enfant_id');
            $table->uuid('vaccin_id');
            $table->uuid('dose_calendrier_enfant_id')->nullable();
            $table->uuid('agent_id');
            $table->uuid('centre_sante_id');
            $table->timestamp('administre_le');
            $table->string('numero_lot')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('cree_le')->useCurrent();

            $table->foreign('enfant_id')->references('id')->on('enfants')->cascadeOnDelete();
            $table->foreign('vaccin_id')->references('id')->on('vaccins')->restrictOnDelete();
            $table->foreign('dose_calendrier_enfant_id')->references('id')->on('doses_calendrier_enfant')->nullOnDelete();
            $table->foreign('agent_id')->references('id')->on('agents')->restrictOnDelete();
            $table->foreign('centre_sante_id')->references('id')->on('centres_sante')->restrictOnDelete();

            $table->index(['enfant_id', 'administre_le']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actes_vaccinaux');
    }
};
PHP

write_file "create_rendez_vous_table" <<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('enfant_id');
            $table->uuid('dose_calendrier_enfant_id')->nullable();
            $table->date('date_cible');
            $table->string('statut')->default('PLANIFIE');
            $table->integer('nombre_rappels')->default(0);
            $table->string('canal')->nullable();
            $table->string('raison_absence')->nullable();
            $table->uuid('reprogramme_depuis_id')->nullable();
            $table->timestamp('cree_le')->useCurrent();

            $table->foreign('enfant_id')->references('id')->on('enfants')->cascadeOnDelete();
            $table->foreign('dose_calendrier_enfant_id')->references('id')->on('doses_calendrier_enfant')->nullOnDelete();
            $table->foreign('reprogramme_depuis_id')->references('id')->on('rendez_vous')->nullOnDelete();

            $table->index(['date_cible', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rendez_vous');
    }
};
PHP

write_file "create_scores_risque_table" <<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('scores_risque', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('enfant_id');
            $table->uuid('rendez_vous_id')->nullable();
            $table->string('version_modele');
            $table->decimal('score', 8, 4);
            $table->string('niveau_risque');
            $table->decimal('confiance', 8, 4);
            $table->json('facteurs_explicatifs')->nullable();
            $table->timestamp('calcule_le')->useCurrent();

            $table->foreign('enfant_id')->references('id')->on('enfants')->cascadeOnDelete();
            $table->foreign('rendez_vous_id')->references('id')->on('rendez_vous')->nullOnDelete();

            $table->index(['enfant_id', 'niveau_risque']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scores_risque');
    }
};
PHP

write_file "create_notifications_sms_table" <<'PHP'
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
PHP

write_file "create_journaux_audit_table" <<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('journaux_audit', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('agent_id')->nullable();
            $table->string('action');
            $table->string('type_cible');
            $table->uuid('id_cible')->nullable();
            $table->string('resultat');
            $table->json('metadonnees')->nullable();
            $table->timestamp('date_evenement')->useCurrent();

            $table->foreign('agent_id')->references('id')->on('agents')->nullOnDelete();
            $table->index(['type_cible', 'id_cible']);
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journaux_audit');
    }
};
PHP

write_file "create_file_synchronisation_table" <<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('file_synchronisation', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('id_appareil');
            $table->string('type_agregat');
            $table->uuid('id_agregat')->nullable();
            $table->string('type_operation');
            $table->json('charge_utile')->nullable();
            $table->string('statut_sync')->default('EN_ATTENTE');
            $table->text('derniere_erreur')->nullable();
            $table->timestamp('cree_le')->useCurrent();
            $table->timestamp('synchronise_le')->nullable();

            $table->index(['statut_sync', 'cree_le']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_synchronisation');
    }
};
PHP

echo "==> Toutes les migrations ont été écrites."
