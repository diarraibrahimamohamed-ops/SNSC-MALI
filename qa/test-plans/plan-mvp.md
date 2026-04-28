# Plan de Test MVP - Vaccin-Track

## Objectif
Valider que le MVP (Minimum Viable Product) de Vaccin-Track fonctionne correctement et répond aux exigences de base.

## Périmètre des Tests

### 1. Tests Fonctionnels

#### 1.1 Authentification
- **TC-001**: Connexion réussie avec identifiants valides
- **TC-002**: Échec de connexion avec mot de passe incorrect
- **TC-003**: Échec de connexion avec email inexistant
- **TC-004**: Déconnexion réussie
- **TC-005**: Session expirée - redirection vers login

#### 1.2 Gestion des Enfants
- **TC-006**: Création d'un nouvel enfant avec informations complètes
- **TC-007**: Création d'un enfant avec validation des champs obligatoires
- **TC-008**: Recherche d'enfants par nom/prénom
- **TC-009**: Affichage des détails d'un enfant
- **TC-010**: Modification des informations d'un enfant
- **TC-011**: Ajout de plusieurs tuteurs à un enfant
- **TC-012**: Validation du format du numéro de téléphone des tuteurs

#### 1.3 Vaccination
- **TC-013**: Enregistrement d'une nouvelle vaccination
- **TC-014**: Validation de la date de vaccination (pas dans le futur)
- **TC-015**: Validation du numéro de dose (positif)
- **TC-016**: Détection des doublons de vaccination
- **TC-017**: Affichage de l'historique vaccinal d'un enfant
- **TC-018**: Enregistrement des effets secondaires
- **TC-019**: Calcul du statut vaccinal (à jour/en retard)

#### 1.4 Rendez-vous
- **TC-020**: Création d'un rendez-vous
- **TC-021**: Validation de la date de rendez-vous (pas dans le passé)
- **TC-022**: Affichage de la liste des rendez-vous du jour
- **TC-023**: Confirmation/Annulation d'un rendez-vous
- **TC-024**: Détection automatique des retards

#### 1.5 Relances SMS
- **TC-025**: Envoi automatique des relances pour rappels
- **TC-026**: Envoi manuel des relances
- **TC-027**: Gestion des échecs d'envoi SMS
- **TC-028**: Suivi du statut des messages envoyés
- **TC-029**: Personnalisation des messages de relance

#### 1.6 Dashboard
- **TC-030**: Affichage des statistiques globales
- **TC-031**: Affichage des vaccinations du jour
- **TC-032**: Affichage des rendez-vous du jour
- **TC-033**: Affichage des enfants à risque
- **TC-034**: Rafraîchissement automatique des données

### 2. Tests d'Intégration

#### 2.1 Base de Données
- **TC-035**: Connexion à la base PostgreSQL
- **TC-036**: Persistance des données
- **TC-037**: Intégrité des relations (enfants-tuteurs, vaccinations-enfants)
- **TC-038**: Performance des requêtes (temps de réponse < 2s)

#### 2.2 Service IA
- **TC-039**: Communication avec le service Python
- **TC-040**: Évaluation du risque de retard vaccinal
- **TC-041**: Gestion des erreurs du service IA
- **TC-042**: Timeout du service IA (5s max)

#### 2.3 SMS Gateway
- **TC-043**: Connexion à la passerelle SMS
- **TC-044**: Formatage des messages
- **TC-045**: Gestion des quotas d'envoi
- **TC-046**: Retry en cas d'échec

### 3. Tests de Performance

#### 3.1 Charge Utilisateur
- **TC-047**: Support de 10 utilisateurs simultanés
- **TC-048**: Temps de réponse des pages < 3s sous charge
- **TC-049**: Pas de dégradation significative après 1000 enregistrements

#### 3.2 Base de Données
- **TC-050**: Performance des requêtes avec 10 000 enfants
- **TC-051**: Indexation efficace des tables principales
- **TC-052**: Optimisation des jointures complexes

### 4. Tests de Sécurité

#### 4.1 Authentification
- **TC-053**: Protection contre les attaques par force brute
- **TC-054**: Validation des tokens JWT
- **TC-055**: Expiration des sessions (24h)

#### 4.2 Autorisation
- **TC-056**: Contrôle d'accès par rôle (admin/agent)
- **TC-057**: Isolation des données entre centres
- **TC-058**: Validation des permissions sur chaque action

#### 4.3 Données
- **TC-059**: Chiffrement des données sensibles (téléphones)
- **TC-060**: Validation des entrées utilisateur
- **TC-061**: Protection contre les injections SQL

### 5. Tests d'Interface Utilisateur

#### 5.1 Navigation
- **TC-062**: Menu de navigation responsive
- **TC-063**: Liens de navigation fonctionnels
- **TC-064**: Breadcrumbs corrects

#### 5.2 Formulaires
- **TC-065**: Validation en temps réel
- **TC-066**: Messages d'erreur clairs
- **TC-067**: Soumission sans rechargement de page

#### 5.3 Affichage
- **TC-068**: Adaptation mobile (responsive design)
- **TC-069**: Accessibilité (contrast, tailles de police)
- **TC-070**: Support des navigateurs modernes

### 6. Tests de Compatibilité

#### 6.1 Navigateurs
- **TC-071**: Chrome (dernière version)
- **TC-072**: Firefox (dernière version)
- **TC-073**: Safari (dernière version)
- **TC-074**: Edge (dernière version)

#### 6.2 Appareils
- **TC-075**: Desktop (1920x1080)
- **TC-076**: Tablettes (768x1024)
- **TC-077**: Mobile (375x667)

## Critères d'Acceptation

### Fonctionnalités Critiques
- Tous les tests TC-001 à TC-034 doivent passer
- Aucun bloquant pour les workflows principaux

### Performance
- Temps de réponse moyen < 2s
- Support de 10 utilisateurs simultanés
- 99% d'uptime pendant les heures de travail

### Sécurité
- Aucune vulnérabilité critique
- Respect des RGPD pour les données personnelles

### Interface
- Toutes les fonctionnalités accessibles sans JavaScript cassé
- Design responsive sur tous les appareils cibles

## Plan d'Exécution

### Phase 1: Tests Unitaires (Semaine 1)
- Tests des modèles et services
- Tests des utilitaires
- Couverture minimale: 80%

### Phase 2: Tests d'Intégration (Semaine 2)
- Tests API
- Tests base de données
- Tests services externes

### Phase 3: Tests Fonctionnels (Semaine 3)
- Tests manuels des workflows
- Tests automatisés E2E
- Tests de l'interface utilisateur

### Phase 4: Tests de Performance et Sécurité (Semaine 4)
- Tests de charge
- Tests de sécurité
- Tests de compatibilité

## Outils et Environnements

### Automatisation
- **Backend**: PHPUnit (PHP)
- **Frontend**: Jest + React Testing Library
- **E2E**: Playwright
- **API**: Postman/Newman

### Environnements
- **Développement**: Local
- **Test**: Docker Compose
- **Pré-production**: Cloud staging
- **Production**: Cloud production

### Reporting
- **Tests Unitaires**: Couverture de code
- **Tests E2E**: Rapports HTML Playwright
- **API**: Rapports Postman
- **Performance**: Graphiques de métriques

## Critères de Validation

### Succès
- 95% des tests passent
- Aucun bloquant résiduel
- Performance conforme aux critères

### Échec
- Moins de 90% des tests passent
- Bloquants critiques non résolus
- Performance sous les seuils attendus

## Documentation

### Livrables
- Plan de test détaillé
- Cas de test documentés
- Rapports d'exécution
- Matrice de traçabilité exigences/tests

### Maintenance
- Mise à jour des cas de test à chaque évolution
- Révision trimestrielle du plan de test
- Formation de l'équipe aux nouveaux tests
