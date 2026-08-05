# Vue d'ensemble de l'architecture

## Architecture Globale

Le système SNSC-MALI (Vaccin Track) est une application monorepo composée de trois services principaux:

### Composants Principaux

1. **Backend API (Laravel)**
   - Port: 8001
   - Framework: Laravel 13.0
   - Base de données: PostgreSQL
   - Responsabilités:
     - Gestion des dossiers enfants
     - Planification vaccinale
     - Suivi des actes vaccinaux
     - Gestion des rendez-vous
     - Authentification et autorisation
     - Audit et traçabilité

2. **Frontend (Next.js)**
   - Port: 3000
   - Framework: Next.js 16.3.0
   - UI: TailwindCSS, shadcn/ui
   - Responsabilités:
     - Interface agent de santé
     - Interface administrateur
     - Tableaux de bord et visualisations
     - Gestion des rendez-vous

3. **Service IA (Python/FastAPI)**
   - Port: 8000
   - Framework: FastAPI
   - Responsabilités:
     - Évaluation du risque de retard vaccinal
     - Calcul des scores de risque
     - Génération d'explicabilités
     - API de prédiction sécurisée

## Flux de Données

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Backend    │────▶│ Service IA  │
│  (Next.js)  │     │  (Laravel)  │     │ (FastAPI)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       └───────────────────┴───────────────────┘
                       │
                       ▼
              ┌─────────────┐
              │ PostgreSQL  │
              │  Database   │
              └─────────────┘
```

## Modules Fonctionnels

### Backend Laravel
- **Auth**: Authentification JWT, RBAC
- **DossierEnfant**: Gestion des dossiers enfants
- **ReferentielVaccins**: Catalogue des vaccins
- **PlanVaccinal**: Génération des calendriers
- **ActeVaccinal**: Enregistrement des vaccinations
- **RendezVous**: Planification et suivi
- **RelanceSMS**: Notifications SMS automatiques
- **Audit**: Journalisation des actions
- **RisqueIA**: Intégration avec le service IA

### Frontend Next.js
- **Auth**: Login, session management
- **Enfants**: CRUD dossiers enfants
- **Vaccinations**: Enregistrement actes
- **Calendrier**: Visualisation calendrier
- **Rendez-vous**: Gestion RDV
- **Relances**: Historique notifications
- **Audit**: Logs d'audit
- **Risque**: Visualisation scores IA

### Service IA
- **API REST**: Endpoints de prédiction
- **Validation**: Pydantic schemas
- **Sécurité**: API token authentication
- **Rate Limiting**: Protection contre abus
- **Audit**: Logging RGPD Article 22

## Infrastructure

### Docker
- **API**: Multi-stage build, PHP 8.2-fpm
- **Web**: Multi-stage build, Node.js 18-alpine
- **IA**: Multi-stage build, Python 3.12-slim
- **PostgreSQL**: Official image
- **Nginx**: Reverse proxy

### Déploiement
- **Dev**: docker-compose.dev.yml
- **Test**: docker-compose.test.yml
- **Prod**: docker-compose.prod.yml

## Sécurité

- **Authentification**: JWT tokens
- **Autorisation**: RBAC (Agent, Admin)
- **Headers HTTP**: Security headers (X-Content-Type-Options, CSP, etc.)
- **Validation**: Input validation stricte
- **Rate Limiting**: Protection contre abus
- **Audit**: Traçabilité complète RGPD

## Intégrations Externes

- **SMS**: Telerivet Gateway
- **IA**: Service interne FastAPI
- **Base de données**: PostgreSQL
