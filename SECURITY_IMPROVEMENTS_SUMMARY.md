# Résumé des Améliorations de Sécurité - Vaccin-Track

## Date: 18 Juin 2026

## 1. JWT Authentication (1.3 Algorithmes)

### ✅ Modifications Apportées

**Passage de HS256 à RS256:**
- Généré des clés RSA asymétriques:
  - Clé privée: `apps/api/storage/jwt/private.pem` (chmod 600)
  - Clé publique: `apps/api/storage/jwt/public.pem` (chmod 644)
- Modifié `apps/api/config/jwt.php`:
  - `algo`: HS256 → RS256
  - `ttl`: 60 → 15 minutes
  - `storage`: Illuminate → Redis (pour blacklist)
- Avantage: Le service IA peut vérifier un JWT avec la clé publique sans pouvoir en émettre

**Configuration .env requise:**
```bash
JWT_ALGO=RS256
JWT_TTL=15
JWT_PUBLIC_KEY=file://./storage/jwt/public.pem
JWT_PRIVATE_KEY=file://./storage/jwt/private.pem
JWT_PASSPHRASE=
JWT_BLACKLIST_ENABLED=true
```

## 2. Politique de Mot de Passe + Verrouillage (2.2)

### ✅ Modifications Apportées

**LoginRequest (`apps/api/app/Http/Requests/LoginRequest.php`):**
- Validation forte du mot de passe:
  - Minimum 12 caractères
  - Lettres minuscules requises
  - Lettres majuscules requises
  - Chiffres requis
  - Caractères spéciaux requis
- Verrouillage progressif après échecs:
  - 5 échecs → délai 1 minute
  - 10 échecs → délai 15 minutes
  - 20 échecs → compte verrouillé (action admin requise)
- Utilisation de RateLimiter pour le suivi des tentatives

**Rate Limiting (`apps/api/routes/api.php`):**
- Ajout de middleware `throttle:5,1` sur `/auth/login`
- 5 requêtes par minute maximum

## 3. Sessions JWT Robustes (2.3)

### ✅ Modifications Apportées

**TTL Court:**
- JWT_TTL réduit de 60 à 15 minutes

**Storage Redis:**
- Blacklist stockée sur Redis au lieu de la base de données
- Configuration dans `config/jwt.php`

**Empreinte Device (`apps/api/app/Http/Controllers/Api/AuthController.php`):**
- Ajout de `device_fingerprint` dans le token JWT
- Génération basée sur User-Agent + IP /24
- Méthode `generateDeviceFingerprint()` créée

**Middleware Vérification (`apps/api/app/Http/Middleware/VerifyDeviceFingerprint.php`):**
- Vérifie que l'empreinte device correspond
- Rejette les requêtes si changement non confirmé
- Enregistré dans `bootstrap/app.php` comme `device.verify`

## 4. Validation des Entrées IA (4.4)

### ✅ Modifications Apportées

**Renforcement Pydantic (`apps/ia/app/models/schemas.py`):**
- Validation des champs numériques:
  - `retards_jours`: 0 ≤ valeur ≤ 10000
  - `confloat`: 0 ≤ valeur ≤ 10000
- Filtrage PII:
  - Clés interdites: nom, prenom, name, first_name, last_name, telephone, phone, email, adresse, address
- Utilisation de `Field` avec contraintes
- Validation personnalisée avec `@field_validator`

## 5. Rate Limiting + Observabilité IA (4.5)

### ✅ Modifications Apportées

**Rate Limiting (`apps/ia/app/main.py`):**
- Installation de `slowapi` et `redis` dans `requirements.txt`
- Configuration du limiter: 60 requêtes/minute/IP
- Application sur endpoint `/predict`
- Gestion des exceptions RateLimitExceeded

**Audit Logging RGPD Article 22:**
- Middleware d'audit dans `main.py`
- Logging de chaque prédiction avec:
  - request_id (UUID)
  - enfant_id_hash (SHA256, 16 caractères)
  - timestamp
  - IP
  - User-Agent
  - endpoint
  - score, niveau_risque, confiance, version_modele
- Endpoint `/audit/logs` pour récupérer les logs (protégé par rate limiting)
- Conservation des 1000 dernières entrées en mémoire

**Anonymisation:**
- Hash de l'enfant_id dans les logs
- Aucune PII dans les logs d'audit

## 6. SMS - Adaptation Telerivet Gateway

### ✅ Modifications Apportées

**Nouveau Service Telerivet (`apps/api/app/Services/TelerivetService.php`):**
- Implémentation complète de l'API Telerivet
- Validation des numéros de téléphone
- Validation de la longueur du message (max 1600 caractères)
- Gestion des erreurs avec logging détaillé
- Masquage des numéros dans les logs (privacy)
- Méthode `healthCheck()` pour vérifier le service
- Support d'envoi en masse avec délai anti-rate limiting

**Mise à jour SmsService (`apps/api/app/Services/SmsService.php`):**
- Ajout du provider 'telerivet'
- Méthode `sendViaTelerivet()` intégrée
- Masquage des numéros dans les logs
- Logging détaillé des succès/erreurs

**Configuration (`apps/api/config/services.php`):**
```php
'telerivet' => [
    'project_id' => env('TELERIVET_PROJECT_ID'),
    'route_id' => env('TELERIVET_ROUTE_ID'),
    'api_key' => env('TELERIVET_API_KEY'),
],
```

**Configuration .env requise:**
```bash
SMS_PROVIDER=telerivet
TELERIVET_PROJECT_ID=PJf9a5208f1388f3ff
TELERIVET_ROUTE_ID=PN6e809b038ab8218a
TELERIVET_API_KEY=votre_api_key_ici
```

## Résumé des Fichiers Modifiés/Créés

### Backend Laravel
- `apps/api/config/jwt.php` - Configuration JWT RS256
- `apps/api/storage/jwt/private.pem` - Clé privée RSA (générée)
- `apps/api/storage/jwt/public.pem` - Clé publique RSA (générée)
- `apps/api/app/Http/Requests/LoginRequest.php` - Validation mot de passe + verrouillage
- `apps/api/app/Http/Controllers/Api/AuthController.php` - Device fingerprint
- `apps/api/app/Http/Middleware/VerifyDeviceFingerprint.php` - Middleware vérification device
- `apps/api/bootstrap/app.php` - Enregistrement middleware
- `apps/api/routes/api.php` - Rate limiting sur login
- `apps/api/app/Services/SmsService.php` - Intégration Telerivet
- `apps/api/app/Services/TelerivetService.php` - Service Telerivet
- `apps/api/config/services.php` - Configuration Telerivet

### Service IA
- `apps/ia/app/models/schemas.py` - Validation Pydantic renforcée
- `apps/ia/app/api/routes_predict.py` - Rate limiting + audit
- `apps/ia/app/main.py` - Middleware audit + rate limiting global
- `apps/ia/requirements.txt` - Ajout slowapi, redis, python-dotenv

### Documentation
- `apps/api/JWT_SECURITY_CONFIG.md` - Configuration JWT
- `SECURITY_IMPROVEMENTS_SUMMARY.md` - Ce document

## Prochaines Étapes Recommandées

1. **Ajouter les variables d'environnement** dans `.env`:
   - JWT_ALGO, JWT_TTL, JWT_PUBLIC_KEY, JWT_PRIVATE_KEY
   - TELERIVET_PROJECT_ID, TELERIVET_ROUTE_ID, TELERIVET_API_KEY
   - SMS_PROVIDER=telerivet

2. **Tester les nouvelles fonctionnalités**:
   - Authentification avec mot de passe fort
   - Verrouillage progressif après échecs
   - Device fingerprint verification
   - Envoi SMS via Telerivet
   - Rate limiting sur endpoints IA

3. **Surveiller les logs d'audit** pour vérifier la conformité RGPD

4. **Configurer Redis** pour la blacklist JWT si pas déjà fait

## Conformité RGPD

- ✅ Article 22: Logging des décisions automatisées IA
- ✅ Minimisation des données: PII filtrée côté IA
- ✅ Anonymisation: Hash des IDs dans les logs
- ✅ Traçabilité: Request IDs uniques
- ✅ Sécurité: Authentification forte, rate limiting, device fingerprint
