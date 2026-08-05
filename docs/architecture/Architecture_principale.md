vaccin-track/
├── .github/
│   ├── CODEOWNERS
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   ├── feature_request.yml
│   │   └── task.yml
│   └── workflows/
│       ├── ci-api.yml
│       ├── ci-web.yml
│       ├── ci-ia.yml
│       ├── docker-build.yml
│       └── security-scan.yml
│
├── docs/
│   ├── README.md
│   ├── adr/
│   │   ├── 001-choix-monorepo.md
│   │   ├── 002-backend-laravel.md
│   │   ├── 003-frontend-nextjs.md
│   │   ├── 004-ia-python.md
│   │   ├── 005-postgresql-uuid.md
│   │   └── 006-mobile-api-only.md
│   ├── diagrams/
│   │   ├── 01_use_case.png
│   │   ├── 02_seq_enregistrer_enfant.png
│   │   ├── 03_seq_enregistrer_vaccination.png
│   │   ├── 04_seq_relance_sms.png
│   │   ├── 05_seq_evaluation_risque.png
│   │   ├── 06_class_domain.png
│   │   ├── 07_deployment.png
│   │   ├── 08_layered_architecture.png
│   │   └── 09_physical_data_model.png
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── backend-modules.md
│   │   ├── frontend-structure.md
│   │   ├── ia-pipeline.md
│   │   ├── security-rbac.md
│   │   ├── audit-strategy.md
│   │   ├── sms-integration.md
│   │   └── sync-strategy.md
│   ├── api/
│   │   ├── openapi.yaml
│   │   ├── conventions.md
│   │   └── error-format.md
│   ├── runbooks/
│   │   ├── deployment.md
│   │   ├── rollback.md
│   │   ├── backups.md
│   │   └── sms-provider.md
│   └── team/
│       ├── workflow-git.md
│       ├── branch-naming.md
│       ├── code-review.md
│       └── onboarding.md
│
├── apps/
│   │
│   ├── api/                    # Backend Laravel
│   │   ├── app/
│   │   │   ├── Console/
│   │   │   │   └── Commands/
│   │   │   │       ├── EvaluerRisquePeriodique.php
│   │   │   │       ├── DeclencherRelancesSMS.php
│   │   │   │       └── DetecterRetardsVaccinaux.php
│   │   │   │
│   │   │   ├── Http/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── Api/
│   │   │   │   │       ├── AuthController.php
│   │   │   │   │       ├── CentreSanteController.php
│   │   │   │   │       ├── AgentController.php
│   │   │   │   │       ├── UtilisateurController.php
│   │   │   │   │       ├── EnfantController.php
│   │   │   │   │       ├── TuteurController.php
│   │   │   │   │       ├── VaccinController.php
│   │   │   │   │       ├── ModeleCalendrierController.php
│   │   │   │   │       ├── CalendrierVaccinalController.php
│   │   │   │   │       ├── ActeVaccinalController.php
│   │   │   │   │       ├── RendezVousController.php
│   │   │   │   │       ├── RelanceSmsController.php
│   │   │   │   │       ├── AuditController.php
│   │   │   │   │       └── RisqueController.php
│   │   │   │   ├── Middleware/
│   │   │   │   │   ├── Authenticate.php
│   │   │   │   │   ├── RoleMiddleware.php
│   │   │   │   │   └── AuditMiddleware.php
│   │   │   │   ├── Requests/
│   │   │   │   │   ├── StoreEnfantRequest.php
│   │   │   │   │   ├── UpdateEnfantRequest.php
│   │   │   │   │   ├── StoreActeVaccinalRequest.php
│   │   │   │   │   ├── StoreCentreSanteRequest.php
│   │   │   │   │   ├── StoreVaccinRequest.php
│   │   │   │   │   └── StoreRendezVousRequest.php
│   │   │   │   └── Resources/
│   │   │   │       ├── EnfantResource.php
│   │   │   │       ├── TuteurResource.php
│   │   │   │       ├── ActeVaccinalResource.php
│   │   │   │       ├── CalendrierVaccinalResource.php
│   │   │   │       ├── RendezVousResource.php
│   │   │   │       ├── NotificationSmsResource.php
│   │   │   │       └── ScoreRisqueResource.php
│   │   │   │
│   │   │   ├── Modules/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── Services/
│   │   │   │   │   │   ├── AuthService.php
│   │   │   │   │   │   └── RbacService.php
│   │   │   │   │   └── Policies/
│   │   │   │   │       └── UserPolicy.php
│   │   │   │   │
│   │   │   │   ├── Admin/
│   │   │   │   │   └── Services/
│   │   │   │   │       ├── CentreSanteService.php
│   │   │   │   │       ├── AgentService.php
│   │   │   │   │       └── UtilisateurService.php
│   │   │   │   │
│   │   │   │   ├── DossierEnfant/
│   │   │   │   │   ├── Services/
│   │   │   │   │   │   ├── EnfantService.php
│   │   │   │   │   │   └── TuteurService.php
│   │   │   │   │   ├── Repositories/
│   │   │   │   │   │   ├── EnfantRepository.php
│   │   │   │   │   │   └── TuteurRepository.php
│   │   │   │   │   └── DTO/
│   │   │   │   │       └── CreerEnfantDTO.php
│   │   │   │   │
│   │   │   │   ├── ReferentielVaccins/
│   │   │   │   │   └── Services/
│   │   │   │   │       ├── VaccinService.php
│   │   │   │   │       └── ModeleCalendrierService.php
│   │   │   │   │
│   │   │   │   ├── PlanVaccinal/
│   │   │   │   │   ├── Services/
│   │   │   │   │   │   ├── PlanVaccinalService.php
│   │   │   │   │   │   ├── GenerateurCalendrierService.php
│   │   │   │   │   │   └── ValidationDoseService.php
│   │   │   │   │   └── Rules/
│   │   │   │   │       ├── IntervalleDoseRule.php
│   │   │   │   │       └── AgeLimiteRule.php
│   │   │   │   │
│   │   │   │   ├── ActeVaccinal/
│   │   │   │   │   └── Services/
│   │   │   │   │       └── ActeVaccinalService.php
│   │   │   │   │
│   │   │   │   ├── RendezVous/
│   │   │   │   │   ├── Services/
│   │   │   │   │   │   ├── RendezVousService.php
│   │   │   │   │   │   └── DetectionRetardService.php
│   │   │   │   │   └── Jobs/
│   │   │   │   │       └── DetecterRetardsJob.php
│   │   │   │   │
│   │   │   │   ├── RelanceSMS/
│   │   │   │   │   ├── Services/
│   │   │   │   │   │   ├── RelanceService.php
│   │   │   │   │   │   └── SmsDispatcherService.php
│   │   │   │   │   ├── Jobs/
│   │   │   │   │   │   └── EnvoyerSmsJob.php
│   │   │   │   │   └── Integrations/
│   │   │   │   │       ├── SmsGatewayClient.php
│   │   │   │   │       └── SmsMessageBuilder.php
│   │   │   │   │
│   │   │   │   ├── Audit/
│   │   │   │   │   ├── Services/
│   │   │   │   │   │   └── AuditService.php
│   │   │   │   │   └── Events/
│   │   │   │   │       ├── ActionAuditable.php
│   │   │   │   │       └── ActionAuditableListener.php
│   │   │   │   │
│   │   │   │   └── RisqueIA/
│   │   │   │       ├── Services/
│   │   │   │       │   ├── RisqueService.php
│   │   │   │       │   ├── CollecteurFeaturesService.php
│   │   │   │       │   └── PythonIAClient.php
│   │   │   │       └── Jobs/
│   │   │   │           └── EvaluerRisqueJob.php
│   │   │   │
│   │   │   ├── Models/
│   │   │   │   ├── User.php
│   │   │   │   ├── CentreSante.php
│   │   │   │   ├── Agent.php
│   │   │   │   ├── Enfant.php
│   │   │   │   ├── Tuteur.php
│   │   │   │   ├── EnfantTuteur.php
│   │   │   │   ├── Vaccin.php
│   │   │   │   ├── ModeleCalendrier.php
│   │   │   │   ├── DoseCalendrierEnfant.php
│   │   │   │   ├── ActeVaccinal.php
│   │   │   │   ├── RendezVous.php
│   │   │   │   ├── ScoreRisque.php
│   │   │   │   ├── NotificationSms.php
│   │   │   │   ├── JournalAudit.php
│   │   │   │   └── FileSynchronisation.php
│   │   │   │
│   │   │   ├── Policies/
│   │   │   │   ├── EnfantPolicy.php
│   │   │   │   ├── ActeVaccinalPolicy.php
│   │   │   │   ├── CentreSantePolicy.php
│   │   │   │   └── AuditPolicy.php
│   │   │   │
│   │   │   ├── Providers/
│   │   │   │   ├── AppServiceProvider.php
│   │   │   │   ├── AuthServiceProvider.php
│   │   │   │   ├── EventServiceProvider.php
│   │   │   │   └── RouteServiceProvider.php
│   │   │   │
│   │   │   └── Support/
│   │   │       ├── Uuid.php
│   │   │       ├── DateUtils.php
│   │   │       └── ApiResponse.php
│   │   │
│   │   ├── bootstrap/
│   │   ├── config/
│   │   │   ├── app.php
│   │   │   ├── auth.php
│   │   │   ├── database.php
│   │   │   ├── queue.php
│   │   │   ├── sms.php
│   │   │   ├── ia.php
│   │   │   └── audit.php
│   │   │
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   │   ├── 2026_04_18_000001_create_centres_sante_table.php
│   │   │   │   ├── 2026_04_18_000002_create_tuteurs_table.php
│   │   │   │   ├── 2026_04_18_000003_create_enfants_table.php
│   │   │   │   ├── 2026_04_18_000004_create_enfant_tuteurs_table.php
│   │   │   │   ├── 2026_04_18_000005_create_agents_table.php
│   │   │   │   ├── 2026_04_18_000006_create_vaccins_table.php
│   │   │   │   ├── 2026_04_18_000007_create_modeles_calendrier_table.php
│   │   │   │   ├── 2026_04_18_000008_create_doses_calendrier_enfant_table.php
│   │   │   │   ├── 2026_04_18_000009_create_actes_vaccinaux_table.php
│   │   │   │   ├── 2026_04_18_000010_create_rendez_vous_table.php
│   │   │   │   ├── 2026_04_18_000011_create_scores_risque_table.php
│   │   │   │   ├── 2026_04_18_000012_create_notifications_sms_table.php
│   │   │   │   ├── 2026_04_18_000013_create_journaux_audit_table.php
│   │   │   │   └── 2026_04_18_000014_create_file_synchronisation_table.php
│   │   │   ├── seeders/
│   │   │   │   ├── DatabaseSeeder.php
│   │   │   │   ├── CentreSanteSeeder.php
│   │   │   │   ├── VaccinSeeder.php
│   │   │   │   └── ModeleCalendrierSeeder.php
│   │   │   └── factories/
│   │   │       ├── EnfantFactory.php
│   │   │       ├── TuteurFactory.php
│   │   │       └── CentreSanteFactory.php
│   │   │
│   │   ├── routes/
│   │   │   ├── api.php
│   │   │   ├── web.php
│   │   │   ├── console.php
│   │   │   └── channels.php
│   │   │
│   │   ├── storage/
│   │   ├── tests/
│   │   │   ├── Feature/
│   │   │   │   ├── EnregistrerEnfantTest.php
│   │   │   │   ├── EnregistrerVaccinationTest.php
│   │   │   │   ├── RelanceSmsTest.php
│   │   │   │   └── AuthTest.php
│   │   │   ├── Unit/
│   │   │   │   ├── GenerateurCalendrierTest.php
│   │   │   │   ├── ValidationDoseTest.php
│   │   │   │   └── CollecteurFeaturesTest.php
│   │   │   └── Integration/
│   │   │       ├── PythonIAClientTest.php
│   │   │       └── SmsGatewayClientTest.php
│   │   │
│   │   ├── docker/
│   │   │   ├── php/Dockerfile
│   │   │   ├── nginx/default.conf
│   │   │   └── postgres/init.sql
│   │   │
│   │   ├── .env.example
│   │   ├── composer.json
│   │   ├── artisan
│   │   └── README.md
│   │
│   ├── web/                    # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   │
│   │   │   │   ├── (admin)/
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── centres/page.tsx
│   │   │   │   │   ├── agents/page.tsx
│   │   │   │   │   ├── utilisateurs/page.tsx
│   │   │   │   │   └── audit/page.tsx
│   │   │   │   │
│   │   │   │   ├── (agent)/
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── dashboard/page.tsx
│   │   │   │   │   ├── enfants/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── nouveau/page.tsx
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       ├── page.tsx
│   │   │   │   │   │       ├── calendrier/page.tsx
│   │   │   │   │   │       └── vacciner/page.tsx
│   │   │   │   │   ├── rendez-vous/page.tsx
│   │   │   │   │   ├── relances/page.tsx
│   │   │   │   │   └── risque/page.tsx
│   │   │   │   │
│   │   │   │   ├── api/
│   │   │   │   │   └── bff/
│   │   │   │   │       ├── auth/route.ts
│   │   │   │   │       ├── enfants/route.ts
│   │   │   │   │       └── dashboard/route.ts
│   │   │   │   │
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── globals.css
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Select.tsx
│   │   │   │   │   ├── Table.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   └── Toast.tsx
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── Topbar.tsx
│   │   │   │   │   └── PageHeader.tsx
│   │   │   │   └── charts/
│   │   │   │       ├── RisqueChart.tsx
│   │   │   │       └── CouvertureChart.tsx
│   │   │   │
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   └── useAuth.ts
│   │   │   │   ├── enfants/
│   │   │   │   │   ├── EnfantForm.tsx
│   │   │   │   │   ├── EnfantList.tsx
│   │   │   │   │   ├── EnfantCard.tsx
│   │   │   │   │   └── useEnfants.ts
│   │   │   │   ├── vaccinations/
│   │   │   │   │   ├── EnregistrerDoseForm.tsx
│   │   │   │   │   └── useVaccinations.ts
│   │   │   │   ├── calendrier/
│   │   │   │   │   ├── CalendrierVaccinal.tsx
│   │   │   │   │   └── useCalendrier.ts
│   │   │   │   ├── rendezvous/
│   │   │   │   │   ├── RendezVousList.tsx
│   │   │   │   │   └── useRendezVous.ts
│   │   │   │   ├── relances/
│   │   │   │   │   ├── RelancesList.tsx
│   │   │   │   │   └── useRelances.ts
│   │   │   │   ├── audit/
│   │   │   │   │   └── AuditList.tsx
│   │   │   │   └── risque/
│   │   │   │       ├── RisqueList.tsx
│   │   │   │       └── ScoreBadge.tsx
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── api/
│   │   │   │   │   ├── client.ts
│   │   │   │   │   ├── endpoints.ts
│   │   │   │   │   └── errors.ts
│   │   │   │   ├── auth/
│   │   │   │   │   ├── session.ts
│   │   │   │   │   └── guards.ts
│   │   │   │   ├── validations/
│   │   │   │   │   ├── enfantSchema.ts
│   │   │   │   │   ├── acteVaccinalSchema.ts
│   │   │   │   │   └── loginSchema.ts
│   │   │   │   ├── types/
│   │   │   │   │   ├── enfant.ts
│   │   │   │   │   ├── tuteur.ts
│   │   │   │   │   ├── vaccin.ts
│   │   │   │   │   ├── calendrier.ts
│   │   │   │   │   ├── rendezvous.ts
│   │   │   │   │   ├── relance.ts
│   │   │   │   │   ├── risque.ts
│   │   │   │   │   └── audit.ts
│   │   │   │   └── utils/
│   │   │   │       ├── dates.ts
│   │   │   │       ├── formatters.ts
│   │   │   │       └── permissions.ts
│   │   │   │
│   │   │   └── styles/
│   │   │       └── theme.ts
│   │   │
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   └── logo.svg
│   │   │
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   │
│   │   ├── .env.example
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── README.md
│   │
│   └── ia/                     # Service IA Python
│       ├── app/
│       │   ├── main.py
│       │   ├── api/
│       │   │   ├── __init__.py
│       │   │   ├── routes_health.py
│       │   │   ├── routes_predict.py
│       │   │   └── routes_evaluate.py
│       │   ├── core/
│       │   │   ├── __init__.py
│       │   │   ├── config.py
│       │   │   ├── security.py
│       │   │   └── logging.py
│       │   ├── models/
│       │   │   ├── __init__.py
│       │   │   ├── schemas.py
│       │   │   └── risque_model.py
│       │   ├── services/
│       │   │   ├── __init__.py
│       │   │   ├── feature_engineering.py
│       │   │   ├── predictor.py
│       │   │   └── explainer.py
│       │   └── data/
│       │       ├── __init__.py
│       │       └── loader.py
│       │
│       ├── ml/
│       │   ├── notebooks/
│       │   │   ├── 01_exploration.ipynb
│       │   │   ├── 02_features.ipynb
│       │   │   └── 03_training.ipynb
│       │   ├── training/
│       │   │   ├── train.py
│       │   │   ├── evaluate.py
│       │   │   └── pipeline.py
│       │   └── artifacts/
│       │       ├── model_v1.pkl
│       │       └── metadata.json
│       │
│       ├── tests/
│       │   ├── test_predict.py
│       │   ├── test_features.py
│       │   └── test_api.py
│       │
│       ├── requirements.txt
│       ├── pyproject.toml
│       ├── Dockerfile
│       ├── .env.example
│       └── README.md
│
├── packages/
│   ├── api-contracts/
│   │   ├── openapi.yaml
│   │   ├── typescript/
│   │   │   └── index.ts
│   │   └── README.md
│   └── shared-types/
│       ├── src/
│       │   ├── enums.ts
│       │   └── common.ts
│       └── package.json
│
├── infra/
│   ├── docker/
│   │   ├── api/Dockerfile
│   │   ├── web/Dockerfile
│   │   ├── ia/Dockerfile
│   │   ├── postgres/Dockerfile
│   │   └── nginx/default.conf
│   ├── compose/
│   │   ├── docker-compose.dev.yml
│   │   ├── docker-compose.test.yml
│   │   └── docker-compose.prod.yml
│   └── scripts/
│       ├── dev-up.sh
│       ├── dev-down.sh
│       ├── seed.sh
│       ├── test.sh
│       └── deploy.sh
│
├── qa/
│   ├── postman/
│   │   └── vaccin-track.postman_collection.json
│   ├── e2e/
│   │   ├── scenarios/
│   │   │   ├── enregistrer-enfant.spec.ts
│   │   │   ├── enregistrer-vaccination.spec.ts
│   │   │   └── relance-sms.spec.ts
│   │   └── playwright.config.ts
│   └── test-plans/
│       ├── plan-mvp.md
│       └── checklist-securite.md
│
├── data/
│   ├── seeds/
│   │   ├── vaccins.json
│   │   ├── modeles_calendrier.json
│   │   └── centres.json
│   ├── mock-json/
│   │   ├── enfants.json
│   │   ├── rendezvous.json
│   │   └── scores.json
│   └── sms-templates/
│       ├── relance_faible.txt
│       ├── relance_moyen.txt
│       └── relance_eleve.txt
│
├── .editorconfig
├── .gitignore
├── .env.example
├── docker-compose.yml
├── Makefile
├── LICENSE
└── README.md


