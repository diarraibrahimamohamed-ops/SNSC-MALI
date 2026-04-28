#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../apps/api"

echo "==> Préparation .env Laravel"
cp -n .env.example .env || true

php artisan key:generate --force

echo "==> Configuration PostgreSQL dans .env"
sed -i 's/^DB_CONNECTION=.*/DB_CONNECTION=pgsql/' .env
sed -i 's/^DB_HOST=.*/DB_HOST=postgres/' .env
sed -i 's/^DB_PORT=.*/DB_PORT=5432/' .env
sed -i 's/^DB_DATABASE=.*/DB_DATABASE=vaccin_track/' .env
sed -i 's/^DB_USERNAME=.*/DB_USERNAME=vaccin_user/' .env
sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=vaccin_pass/' .env
sed -i 's/^QUEUE_CONNECTION=.*/QUEUE_CONNECTION=database/' .env || echo "QUEUE_CONNECTION=database" >> .env

echo "==> Création des dossiers modules"
mkdir -p app/Modules/Auth/Services app/Modules/Auth/Policies
mkdir -p app/Modules/Admin/Services
mkdir -p app/Modules/DossierEnfant/Services app/Modules/DossierEnfant/Repositories app/Modules/DossierEnfant/DTO
mkdir -p app/Modules/ReferentielVaccins/Services
mkdir -p app/Modules/PlanVaccinal/Services app/Modules/PlanVaccinal/Rules
mkdir -p app/Modules/ActeVaccinal/Services
mkdir -p app/Modules/RendezVous/Services app/Modules/RendezVous/Jobs
mkdir -p app/Modules/RelanceSMS/Services app/Modules/RelanceSMS/Jobs app/Modules/RelanceSMS/Integrations
mkdir -p app/Modules/Audit/Services app/Modules/Audit/Events
mkdir -p app/Modules/RisqueIA/Services app/Modules/RisqueIA/Jobs
mkdir -p app/Support
mkdir -p tests/Integration

echo "==> Création des modèles"
for model in CentreSante Agent Enfant Tuteur EnfantTuteur Vaccin ModeleCalendrier DoseCalendrierEnfant ActeVaccinal RendezVous ScoreRisque NotificationSms JournalAudit FileSynchronisation; do
  php artisan make:model "$model" --no-interaction || true
done

echo "==> Création des controllers API"
for ctrl in Auth CentreSante Agent Utilisateur Enfant Tuteur Vaccin ModeleCalendrier CalendrierVaccinal ActeVaccinal RendezVous RelanceSms Audit Risque; do
  php artisan make:controller "Api/${ctrl}Controller" --api --no-interaction || true
done

echo "==> Création des Form Requests"
for req in StoreEnfant UpdateEnfant StoreActeVaccinal StoreCentreSante StoreVaccin StoreRendezVous; do
  php artisan make:request "${req}Request" --no-interaction || true
done

echo "==> Création des API Resources"
for res in Enfant Tuteur ActeVaccinal CalendrierVaccinal RendezVous NotificationSms ScoreRisque; do
  php artisan make:resource "${res}Resource" --no-interaction || true
done

echo "==> Création des services, repositories, rules"
for class in \
  Modules/Auth/Services/AuthService \
  Modules/Auth/Services/RbacService \
  Modules/Admin/Services/CentreSanteService \
  Modules/Admin/Services/AgentService \
  Modules/Admin/Services/UtilisateurService \
  Modules/DossierEnfant/Services/EnfantService \
  Modules/DossierEnfant/Services/TuteurService \
  Modules/DossierEnfant/Repositories/EnfantRepository \
  Modules/DossierEnfant/Repositories/TuteurRepository \
  Modules/DossierEnfant/DTO/CreerEnfantDTO \
  Modules/ReferentielVaccins/Services/VaccinService \
  Modules/ReferentielVaccins/Services/ModeleCalendrierService \
  Modules/PlanVaccinal/Services/PlanVaccinalService \
  Modules/PlanVaccinal/Services/GenerateurCalendrierService \
  Modules/PlanVaccinal/Services/ValidationDoseService \
  Modules/PlanVaccinal/Rules/IntervalleDoseRule \
  Modules/PlanVaccinal/Rules/AgeLimiteRule \
  Modules/ActeVaccinal/Services/ActeVaccinalService \
  Modules/RendezVous/Services/RendezVousService \
  Modules/RendezVous/Services/DetectionRetardService \
  Modules/RelanceSMS/Services/RelanceService \
  Modules/RelanceSMS/Services/SmsDispatcherService \
  Modules/RelanceSMS/Integrations/SmsGatewayClient \
  Modules/RelanceSMS/Integrations/SmsMessageBuilder \
  Modules/Audit/Services/AuditService \
  Modules/Audit/Events/ActionAuditable \
  Modules/Audit/Events/ActionAuditableListener \
  Modules/RisqueIA/Services/RisqueService \
  Modules/RisqueIA/Services/CollecteurFeaturesService \
  Modules/RisqueIA/Services/PythonIAClient \
  Support/Uuid \
  Support/DateUtils \
  Support/ApiResponse
do
  php artisan make:class "$class" --no-interaction || true
done

echo "==> Création des policies"
for policy in Enfant ActeVaccinal CentreSante Audit; do
  php artisan make:policy "${policy}Policy" --no-interaction || true
done

echo "==> Création des commandes"
php artisan make:command EvaluerRisquePeriodique --no-interaction || true
php artisan make:command DeclencherRelancesSMS --no-interaction || true
php artisan make:command DetecterRetardsVaccinaux --no-interaction || true

echo "==> Création des jobs"
for job in DetecterRetardsJob EnvoyerSmsJob EvaluerRisqueJob; do
  php artisan make:job "$job" --no-interaction || true
done

echo "==> Création des tests"
for test in EnregistrerEnfantTest EnregistrerVaccinationTest RelanceSmsTest AuthTest; do
  php artisan make:test "Feature/${test}" --no-interaction || true
done

for test in GenerateurCalendrierTest ValidationDoseTest CollecteurFeaturesTest; do
  php artisan make:test "Unit/${test}" --unit --no-interaction || true
done

for test in PythonIAClientTest SmsGatewayClientTest; do
  php artisan make:test "Integration/${test}" --no-interaction || true
done

echo "==> Création des migrations vides"
for migration in \
  create_centres_sante_table \
  create_tuteurs_table \
  create_enfants_table \
  create_enfant_tuteurs_table \
  create_agents_table \
  create_vaccins_table \
  create_modeles_calendrier_table \
  create_doses_calendrier_enfant_table \
  create_actes_vaccinaux_table \
  create_rendez_vous_table \
  create_scores_risque_table \
  create_notifications_sms_table \
  create_journaux_audit_table \
  create_file_synchronisation_table
do
  php artisan make:migration "$migration" --no-interaction || true
done

echo "==> Création fichiers config custom"
touch config/sms.php
touch config/ia.php
touch config/audit.php

echo "==> Scaffold Laravel terminé"
