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

# Démarrer les services
docker-compose up -d

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

### Santé maternelle — plan de travail
- [Plan d'évolution du suivi maternel](docs/PLAN_EVOLUTION_MATERNELLE.md)
- [Cadre d'usage des fonctions IA](docs/IA_CADRE_NON_DECISIONNEL.md)

### Accès au journal d'audit IA
L'endpoint `/audit/logs` est désactivé si `AUDIT_LOGS_TOKEN` n'est pas configuré. Pour l'activer dans un environnement de développement contrôlé, définir un jeton aléatoire robuste dans le fichier `.env` à la racine du projet :

```dotenv
AUDIT_LOGS_TOKEN=remplacer_par_un_secret_long_et_aleatoire
```

Puis redémarrer le service IA. L'accès s'effectue avec un en-tête `Authorization: Bearer <jeton>`. Ne pas versionner de vraie valeur de jeton. En production, utiliser un gestionnaire de secrets et limiter l'accès réseau à cette route.

## Sécurité

Pour les informations de sécurité récentes, voir [`SECURITY_IMPROVEMENTS_SUMMARY.md`](../SECURITY_IMPROVEMENTS_SUMMARY.md).
