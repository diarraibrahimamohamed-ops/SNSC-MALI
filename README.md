# Documentation SNSC-MALI (Vaccin Track)

Système National de Suivi et de Contrôle de la Calendrierisation de la Vaccination au Mali.

## Structure de la Documentation

### Architecture
- [`architecture/overview.md`](architecture/overview.md) - Vue d'ensemble de l'architecture système
- [`architecture/Architecture_principale.md`](architecture/Architecture_principale.md) - Structure détaillée du projet
- [`architecture/backend-modules.md`](architecture/backend-modules.md) - Modules du backend Laravel
- [`architecture/frontend-structure.md`](architecture/frontend-structure.md) - Structure du frontend Next.js
- [`architecture/ia-pipeline.md`](architecture/ia-pipeline.md) - Pipeline IA et évaluation des risques
- [`architecture/security-rbac.md`](architecture/security-rbac.md) - Sécurité et contrôle d'accès
- [`architecture/audit-strategy.md`](architecture/audit-strategy.md) - Stratégie d'audit et traçabilité
- [`architecture/sms-integration.md`](architecture/sms-integration.md) - Intégration SMS (Telerivet)

### API
- [`api/conventions.md`](api/conventions.md) - Conventions de l'API REST
- [`api/error-format.md`](api/error-format.md) - Format des erreurs API

### ADR (Architecture Decision Records)
- [`adr/001-choix-monorepo.md`](adr/001-choix-monorepo.md) - Choix du monorepo
- [`adr/002-backend-laravel.md`](adr/002-backend-laravel.md) - Choix de Laravel pour le backend
- [`adr/003-frontend-nextjs.md`](adr/003-frontend-nextjs.md) - Choix de Next.js pour le frontend
- [`adr/004-ia-python.md`](adr/004-ia-python.md) - Choix de Python/FastAPI pour le service IA
- [`adr/005-postgresql-uuid.md`](adr/005-postgresql-uuid.md) - Choix de PostgreSQL avec UUID
- [`adr/006-mobile-api-only.md`](adr/006-mobile-api-only.md) - Stratégie mobile API-only

### Équipe
- [`team/onboarding.md`](team/onboarding.md) - Guide d'intégration des nouveaux développeurs
- [`team/workflow-git.md`](team/workflow-git.md) - Workflow Git et conventions
- [`team/branch-naming.md`](team/branch-naming.md) - Convention de nommage des branches
- [`team/code-review.md`](team/code-review.md) - Processus de code review

### Autres
- [`DIAGNOSTIC_CORS.md`](DIAGNOSTIC_CORS.md) - Diagnostic et résolution des problèmes CORS

## Démarrage Rapide

### Prérequis
- Docker et Docker Compose
- Node.js 18+
- PHP 8.2+
- Python 3.12+

### Installation
```bash
# Cloner le repository
git clone https://github.com/diarraibrahimamohamed-ops/SNSC-MALI.git
cd SNSC-MALI

# Préparer les variables d'environnement (remplacer le mot de passe d'exemple)
cp .env.example .env
# Éditer .env et remplacer POSTGRES_PASSWORD par un secret aléatoire unique.

# Démarrer les services; l'API initialise son .env et ses clés JWT si absents
docker compose up -d

# Installer les dépendances
cd apps/api && composer install
cd ../web && npm install
cd ../ia && pip install -r requirements.txt
```

### Services
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **Service IA**: http://localhost:8080
- **Documentation IA**: http://localhost:8080/docs

### Navigation du suivi maternel dans l'espace agent
- `/agent/meres` : liste et création des dossiers mères.
- `/agent/meres/{id}` : dossier longitudinal de la mère, antécédents obstétricaux, grossesses liées, chronologie et suivi post-partum.
- `/agent/grossesses` : liste paginée et filtrable des grossesses du périmètre de la structure.
- `/agent/grossesses/{id}` : dossier de grossesse avec navigation par ancres/onglets entre contacts, rendez-vous, symptômes, mesures, examens et accouchement.
- `/agent/rendez-vous-prenataux` : agenda transversal des rendez-vous prénataux; distinct du calendrier vaccinal de l'enfant.

L'accès aux fiches est contrôlé par l'API selon le centre de santé de l'utilisateur connecté. Les pages de suivi prénatal restent des outils d'enregistrement et de consultation des données, pas des outils de diagnostic.

### Santé maternelle — plan de travail
- [Plan d'évolution du suivi maternel](docs/PLAN_EVOLUTION_MATERNELLE.md)
- [Cadre d'usage des fonctions IA](docs/IA_CADRE_NON_DECISIONNEL.md)

### Configuration et clés
- Copier `.env.example` vers `.env` et remplacer le mot de passe d'exemple avant le démarrage.
- L'API copie `apps/api/.env.example` vers `apps/api/.env` si nécessaire et génère une paire JWT locale si les deux fichiers de clés sont absents.
- Les clés privées JWT sont propres à chaque environnement et ne doivent jamais être commitées. Voir [la politique de gestion des secrets](docs/SECURITE_SECRETS.md).

### Calendrier et rappels prénataux
Le dossier de grossesse permet de planifier un rendez-vous, de le marquer réalisé/manqué/annulé ou de le reporter (le report conserve l'ancien rendez-vous et crée un nouvel enregistrement). Les rappels sont exécutés par Laravel Scheduler dans le conteneur `scheduler`.

Après avoir démarré les conteneurs, appliquer les migrations explicitement :

```bash
docker compose exec api php artisan migrate --force
```

Pour vérifier les rappels sans aucun envoi ni modification de données, utiliser d'abord le mode simulation :

```bash
docker compose exec api php artisan maternite:rappels-prenataux --dry-run --limit=10
```

**Sans `--dry-run`, la commande peut envoyer de vrais SMS.** Ne l'exécuter que dans un environnement contrôlé avec des rendez-vous de test et un fournisseur SMS configuré intentionnellement. La commande n'envoie un SMS que si un consentement actif `SMS_RENDEZ_VOUS` est enregistré pour la mère et la structure concernée, avec un numéro disponible, et si Telerivet est configuré. Le SMS reste générique et ne mentionne ni grossesse, ni examen, ni symptôme. Aucun rappel n'est envoyé sans consentement actif.

### Référentiel versionné des examens prénataux
- `GET /api/v1/catalogues/examens-prenataux?version_protocole=...` : consulter les définitions d'une version de protocole.
- `POST /api/v1/catalogues/examens-prenataux` : publier une définition; cette opération est réservée au rôle administrateur.
- `GET /api/v1/grossesses/{grossesse}/examens-attendus` : afficher les définitions de la version affectée à la grossesse, la fenêtre gestationnelle configurée et indiquer uniquement si un résultat est enregistré.

Le référentiel est volontairement vide par défaut. Avant de l'alimenter, faire valider par les autorités sanitaires compétentes les définitions, la version du protocole, les fenêtres de semaines et les références documentaires. Une version déjà publiée ne se modifie pas silencieusement : publiez une nouvelle version en cas de changement. L'âge gestationnel affiché est une estimation technique à vérifier et la page reste informative; l'absence d'entrée ou de résultat ne signifie pas qu'un examen n'est pas nécessaire.

### Accès au journal d'audit IA
L'endpoint `/audit/logs` est désactivé si `AUDIT_LOGS_TOKEN` n'est pas configuré. Pour l'activer dans un environnement de développement contrôlé, définir un jeton aléatoire robuste dans le fichier `.env` à la racine du projet :

```dotenv
AUDIT_LOGS_TOKEN=remplacer_par_un_secret_long_et_aleatoire
```

Puis redémarrer le service IA. L'accès s'effectue avec un en-tête `Authorization: Bearer <jeton>`. Ne pas versionner de vraie valeur de jeton. En production, utiliser un gestionnaire de secrets et limiter l'accès réseau à cette route.

## Sécurité

Pour les informations de sécurité récentes, voir [`SECURITY_IMPROVEMENTS_SUMMARY.md`](../SECURITY_IMPROVEMENTS_SUMMARY.md).
