# Modules Backend Laravel

## Structure Modulaire

Le backend Laravel est organisé en modules fonctionnels indépendants, chacun contenant ses propres services, repositories, DTOs et règles métier.

## Modules Disponibles

### 1. Auth Module
**Emplacement**: `app/Modules/Auth/`

**Responsabilités**:
- Authentification JWT
- Gestion des sessions
- Contrôle d'accès (RBAC)
- Politiques d'autorisation

**Services**:
- `AuthService`: Gestion des tokens et sessions
- `RbacService`: Vérification des rôles et permissions

**Policies**:
- `UserPolicy`: Contrôle d'accès utilisateurs

### 2. Admin Module
**Emplacement**: `app/Modules/Admin/`

**Responsabilités**:
- Gestion des centres de santé
- Gestion des agents
- Gestion des utilisateurs administrateurs

**Services**:
- `CentreSanteService`: CRUD centres de santé
- `AgentService`: Gestion agents de santé
- `UtilisateurService`: Gestion utilisateurs admin

### 3. DossierEnfant Module
**Emplacement**: `app/Modules/DossierEnfant/`

**Responsabilités**:
- Gestion des dossiers enfants
- Gestion des tuteurs
- Création et modification d'enfants

**Services**:
- `EnfantService`: Logique métier enfants
- `TuteurService`: Gestion tuteurs

**Repositories**:
- `EnfantRepository`: Accès données enfants
- `TuteurRepository`: Accès données tuteurs

**DTOs**:
- `CreerEnfantDTO`: Structure création enfant

### 4. ReferentielVaccins Module
**Emplacement**: `app/Modules/ReferentielVaccins/`

**Responsabilités**:
- Catalogue des vaccins
- Modèles de calendriers vaccinaux
- Référentiels nationaux

**Services**:
- `VaccinService`: Gestion vaccins
- `ModeleCalendrierService`: Gestion modèles calendriers

### 5. PlanVaccinal Module
**Emplacement**: `app/Modules/PlanVaccinal/`

**Responsabilités**:
- Génération des calendriers personnalisés
- Validation des doses
- Gestion des plannings

**Services**:
- `PlanVaccinalService`: Gestion plannings
- `GenerateurCalendrierService`: Génération automatique
- `ValidationDoseService`: Validation règles vaccinales

**Rules**:
- `IntervalleDoseRule`: Validation intervalles
- `AgeLimiteRule`: Validation âges limites

### 6. ActeVaccinal Module
**Emplacement**: `app/Modules/ActeVaccinal/`

**Responsabilités**:
- Enregistrement des vaccinations
- Suivi des actes
- Mise à jour du calendrier

**Services**:
- `ActeVaccinalService`: Gestion actes vaccinaux

### 7. RendezVous Module
**Emplacement**: `app/Modules/RendezVous/`

**Responsabilités**:
- Planification des rendez-vous
- Détection des retards
- Gestion des annulations

**Services**:
- `RendezVousService`: Gestion RDV
- `DetectionRetardService`: Calcul retards

**Jobs**:
- `DetecterRetardsJob`: Job planifié détection retards

### 8. RelanceSMS Module
**Emplacement**: `app/Modules/RelanceSMS/`

**Responsabilités**:
- Envoi automatique de SMS
- Gestion des notifications
- Intégration Telerivet

**Services**:
- `RelanceService`: Orchestration relances
- `SmsDispatcherService`: Distribution SMS

**Jobs**:
- `EnvoyerSmsJob`: Job envoi SMS asynchrone

**Intégrations**:
- `SmsGatewayClient`: Client Telerivet
- `SmsMessageBuilder`: Construction messages

### 9. Audit Module
**Emplacement**: `app/Modules/Audit/`

**Responsabilités**:
- Journalisation des actions
- Traçabilité RGPD
- Logs d'audit

**Services**:
- `AuditService`: Journalisation événements

**Events**:
- `ActionAuditable`: Événement action auditable
- `ActionAuditableListener`: Listener audit

### 10. RisqueIA Module
**Emplacement**: `app/Modules/RisqueIA/`

**Responsabilités**:
- Intégration service IA
- Collecte de features
- Évaluation des risques

**Services**:
- `RisqueService`: Gestion scores risque
- `CollecteurFeaturesService`: Collecte données IA
- `PythonIAClient`: Client HTTP service IA

**Jobs**:
- `EvaluerRisqueJob`: Job évaluation risque asynchrone

## Communication Inter-Modules

Les modules communiquent via:
- **Services**: Injection de dépendances
- **Events**: Laravel Event system
- **Jobs**: Queue asynchrone
- **Repositories**: Pattern Repository

## Sécurité par Module

Chaque module implémente:
- Validation des entrées (FormRequest)
- Politiques d'autorisation (Policies)
- Audit des actions (AuditService)
- Gestion des erreurs (Exceptions)
