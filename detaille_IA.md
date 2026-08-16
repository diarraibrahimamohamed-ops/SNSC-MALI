# Documentation Détaillée IA et Sécurité - Vaccin-Track

## Table des Matières
1. [Modèle Machine Learning Utilisé](#modèle-machine-learning-utilisé)
2. [Architecture du Système IA](#architecture-du-système-ia)
3. [Implémentation Étape par Étape](#implémentation-étape-par-étape)
4. [Stratégies de Sécurité](#stratégies-de-sécurité)
5. [Conformité RGPD](#conformité-rgpd)
6. [Évolutions Futures Possibles](#évolutions-futures-possibles)

---

## Modèle Machine Learning Utilisé

### Type de Modèle Actuel: Heuristique Basée sur des Règles

Le système utilise actuellement un **modèle heuristique** (RisqueModel) plutôt qu'un modèle ML traditionnel entraîné sur des données. Ce choix a été fait pour plusieurs raisons:

- **Rapidité de déploiement**: Pas besoin de collecter et annoter un large dataset
- **Interprétabilité totale**: Les règles sont explicites et compréhensibles
- **Performance prévisible**: Comportement déterministe
- **Maintenance simplifiée**: Facile à modifier les règles métier

### Fichier: `apps/ia/app/models/risque_model.py`

```python
class RisqueModel:
    def predict(self, features: dict):
        retards = features.get('retards_jours', 0)
        absences = features.get('rendez_vous_manques', 0)
        distance = features.get('distance_km', 5)
        
        # Score de base calculé heuristiquement
        score_base = (retards * 0.05) + (absences * 0.15) + (distance * 0.01)
        score = min(max(round(score_base, 2), 0.0), 1.0)
        
        # Classification du niveau de risque
        if retards > 14 or absences >= 2:
            niveau_risque = "ELEVE"
            confiance = 0.95
            score = max(score, 0.8)
        elif retards > 0 or absences >= 1:
            niveau_risque = "MOYEN"
            confiance = 0.85
            score = max(score, 0.5)
        elif score < 0.3:
            niveau_risque = "FAIBLE"
            confiance = 0.90
        elif score < 0.7:
            niveau_risque = "MOYEN"
            confiance = 0.75
        else:
            niveau_risque = "ELEVE"
            confiance = 0.85
```

### Formules Mathématiques Utilisées

**Score de base:**
```
score_base = (retards_jours × 0.05) + (rdv_manqués × 0.15) + (distance_km × 0.01)
```

**Normalisation:**
```
score = min(max(round(score_base, 2), 0.0), 1.0)
```

### Facteurs Explicatifs

Le modèle fournit des explications sur l'impact de chaque facteur:
- **Impact retard**: Fort si retards > 10 jours
- **Impact distance**: Fort si distance > 30 km
- **Impact absence**: Fort si absences ≥ 2

---

## Architecture du Système IA

### Structure des Dossiers

```
apps/ia/
├── app/
│   ├── api/
│   │   ├── routes_predict.py      # Endpoint de prédiction
│   │   ├── routes_health.py       # Health check
│   │   └── routes_evaluate.py     # Évaluation du modèle
│   ├── core/
│   │   ├── config.py              # Configuration
│   │   ├── security.py            # Sécurité (API_TOKEN)
│   │   └── logging.py             # Logging
│   ├── models/
│   │   ├── risque_model.py        # Modèle heuristique
│   │   └── schemas.py             # Schémas Pydantic
│   ├── services/
│   │   ├── predictor.py           # Service de prédiction
│   │   ├── feature_engineering.py # Feature engineering
│   │   └── explainer.py            # Explicabilité
│   └── main.py                    # Application FastAPI
├── ml/
│   └── training/
│       ├── train.py               # Entraînement (placeholder)
│       ├── pipeline.py            # Pipeline ML (placeholder)
│       └── evaluate.py            # Évaluation (placeholder)
└── requirements.txt               # Dépendances Python
```

### Flux de Données

```
Client (Frontend) 
    ↓ HTTP POST /predict
FastAPI (main.py)
    ↓ Validation Pydantic
Predictor Service
    ↓ Feature Engineering
RisqueModel
    ↓ Prédiction
Réponse JSON (score, niveau_risque, confiance)
```

---

## Implémentation Étape par Étape

### Étape 1: Configuration de l'Environnement

**Fichier: `apps/ia/requirements.txt`**
```txt
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
slowapi==0.1.9
redis==5.0.1
python-dotenv==1.0.0
```

**Installation:**
```bash
cd apps/ia
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Étape 2: Création du Modèle Heuristique

**Objectif:** Créer un modèle qui évalue le risque de non-vaccination basé sur des règles métier.

**Implémentation dans `risque_model.py`:**

1. **Définition de la classe RisqueModel**
   - Méthode `predict(features: dict)` qui prend un dictionnaire de caractéristiques
   - Extraction des variables: retards_jours, rendez_vous_manques, distance_km

2. **Calcul du score de base**
   - Formule pondérée: chaque facteur a un poids spécifique
   - Retards: 0.05 par jour
   - Absences: 0.15 par RDV manqué
   - Distance: 0.01 par km

3. **Classification du risque**
   - **ÉLEVÉ**: > 14 jours de retard OU ≥ 2 absences
   - **MOYEN**: > 0 retard OU ≥ 1 absence
   - **FAIBLE**: Score < 0.3 et aucun retard

4. **Calcul de la confiance**
   - Basé sur la sévérité des facteurs
   - Plus les facteurs sont extrêmes, plus la confiance est élevée

### Étape 3: Validation des Entrées avec Pydantic

**Fichier: `apps/ia/app/models/schemas.py`**

**Objectif:** Valider et nettoyer les données d'entrée pour éviter les injections et garantir la qualité.

**Implémentation:**

1. **Schéma de prédiction**
```python
from pydantic import BaseModel, Field, field_validator

class PredictionRequest(BaseModel):
    enfant_id: str = Field(..., min_length=1, max_length=255)
    retards_jours: int = Field(..., ge=0, le=10000)
    rendez_vous_manques: int = Field(..., ge=0, le=1000)
    distance_km: float = Field(..., ge=0, le=1000)
    
    @field_validator('enfant_id')
    def validate_no_pii(cls, v):
        forbidden = ['nom', 'prenom', 'name', 'first_name', 'last_name']
        if any(f in v.lower() for f in forbidden):
            raise ValueError('PII detected')
        return v
```

2. **Validation des contraintes**
   - Valeurs numériques bornées (0 ≤ valeur ≤ maximum)
   - Longueur des chaînes limitée
   - Filtrage des données personnelles (PII)

### Étape 4: Service de Prédiction

**Fichier: `apps/ia/app/services/predictor.py`**

**Objectif:** Fournir une interface propre pour les prédictions.

**Implémentation:**
```python
from app.models.risque_model import RisqueModel

def predict(features: dict) -> float:
    model = RisqueModel()
    return model.predict(features)
```

### Étape 5: API FastAPI avec Endpoints

**Fichier: `apps/ia/app/api/routes_predict.py`**

**Objectif:** Exposer le modèle via une API REST.

**Implémentation:**

1. **Endpoint de prédiction**
```python
from fastapi import APIRouter, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.models.schemas import PredictionRequest
from app.services.predictor import predict

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/predict")
@limiter.limit("60/minute")
async def make_prediction(request: PredictionRequest):
    try:
        features = {
            'retards_jours': request.retards_jours,
            'rendez_vous_manques': request.rendez_vous_manques,
            'distance_km': request.distance_km
        }
        result = predict(features)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

2. **Rate limiting**
   - 60 requêtes par minute par IP
   - Protection contre les abus

### Étape 6: Middleware d'Audit (RGPD Article 22)

**Fichier: `apps/ia/app/main.py`**

**Objectif:** Logger toutes les décisions automatisées pour conformité RGPD.

**Implémentation:**

1. **Génération de request ID unique**
```python
import uuid
request_id = str(uuid.uuid4())
```

2. **Anonymisation des données sensibles**
```python
import hashlib
enfant_id_hash = hashlib.sha256(body.get('enfant_id', '').encode()).hexdigest()[:16]
```

3. **Logging structuré**
```python
audit_entry = {
    "request_id": request_id,
    "enfant_id_hash": enfant_id_hash,
    "timestamp": datetime.utcnow().isoformat(),
    "ip": request.client.host,
    "user_agent": request.headers.get("user-agent"),
    "endpoint": str(request.url),
    "score": response_body.get("score"),
    "niveau_risque": response_body.get("niveau_risque"),
    "confiance": response_body.get("confiance"),
    "version_modele": response_body.get("version_modele")
}
```

4. **Endpoint de récupération des logs**
```python
@app.get("/audit/logs")
@limiter.limit("60/minute")
async def get_audit_logs(request: Request):
    return {
        "total_entries": len(audit_log),
        "logs": audit_log[-100:]  # Dernières 100 entrées
    }
```

### Étape 7: Lancement du Service

**Commande de démarrage:**
```bash
cd apps/ia
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

**Configuration Docker:**
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
```

---

## Stratégies de Sécurité

### 1. Authentification JWT avec RS256

**Fichiers concernés:**
- `apps/api/config/jwt.php`
- `apps/api/storage/jwt/private.pem`
- `apps/api/storage/jwt/public.pem`

**Implémentation:**

**Génération des clés RSA:**
```bash
cd apps/api/storage/jwt
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
chmod 600 private.pem
chmod 644 public.pem
```

**Configuration JWT:**
```php
// config/jwt.php
'algo' => env('JWT_ALGO', 'RS256'),
'ttl' => env('JWT_TTL', 15),  // 15 minutes
'public_key' => env('JWT_PUBLIC_KEY'),
'private_key' => env('JWT_PRIVATE_KEY'),
```

**Avantages de RS256 sur HS256:**
- **Asymétrique**: Clé publique pour vérification, clé privée pour signature
- **Séparation des responsabilités**: Le service IA peut vérifier sans signer
- **Sécurité renforcée**: Compromission d'un service ne compromet pas l'autre

### 2. Politique de Mot de Passe Fort

**Fichier: `apps/api/app/Http/Requests/LoginRequest.php`**

**Règles de validation:**
- Minimum 12 caractères
- Au moins une lettre minuscule
- Au moins une lettre majuscule
- Au moins un chiffre
- Au moins un caractère spécial

**Verrouillage progressif:**
```
5 échecs → Délai 1 minute
10 échecs → Délai 15 minutes
20 échecs → Compte verrouillé (action admin requise)
```

**Implémentation:**
```php
public function rules()
{
    return [
        'email' => 'required|email',
        'password' => [
            'required',
            'min:12',
            'regex:/[a-z]/',      // Minuscule
            'regex:/[A-Z]/',      // Majuscule
            'regex:/[0-9]/',      // Chiffre
            'regex:/[^a-zA-Z0-9]/' // Spécial
        ]
    ];
}
```

### 3. Empreinte Device (Device Fingerprint)

**Fichier: `apps/api/app/Http/Controllers/Api/AuthController.php`**

**Objectif:** Détecter les changements de device pour prévenir le vol de token.

**Implémentation:**

1. **Génération de l'empreinte**
```php
private function generateDeviceFingerprint($request)
{
    $userAgent = $request->userAgent();
    $ip = $request->ip();
    $ipSubnet = implode('.', array_slice(explode('.', $ip), 0, 3));
    
    return hash('sha256', $userAgent . $ipSubnet);
}
```

2. **Injection dans le JWT**
```php
$deviceFingerprint = $this->generateDeviceFingerprint($request);
$token = JWT::encode([
    'sub' => $user->id,
    'device_fingerprint' => $deviceFingerprint,
    // ...
], $privateKey, 'RS256');
```

3. **Middleware de vérification**
```php
// app/Http/Middleware/VerifyDeviceFingerprint.php
public function handle($request, Closure $next)
{
    $token = $request->bearerToken();
    $payload = JWT::decode($token, new Key($publicKey, 'RS256'));
    
    $currentFingerprint = $this->generateDeviceFingerprint($request);
    
    if ($payload->device_fingerprint !== $currentFingerprint) {
        return response()->json(['error' => 'Device mismatch'], 401);
    }
    
    return $next($request);
}
```

### 4. Rate Limiting Global

**Fichier: `apps/ia/app/main.py`**

**Configuration:**
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

**Application sur endpoints:**
```python
@app.post("/predict")
@limiter.limit("60/minute")
async def predict_endpoint(request: PredictionRequest):
    # ...
```

**Endpoints Laravel:**
```php
// routes/api.php
Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');  // 5 requêtes par minute
```

### 5. Validation des Entrées IA

**Fichier: `apps/ia/app/models/schemas.py`**

**Stratégies de validation:**

1. **Bornes numériques strictes**
```python
retards_jours: int = Field(..., ge=0, le=10000)
rendez_vous_manques: int = Field(..., ge=0, le=1000)
distance_km: float = Field(..., ge=0, le=1000)
```

2. **Filtrage PII**
```python
forbidden_keys = ['nom', 'prenom', 'name', 'first_name', 'last_name', 
                  'telephone', 'phone', 'email', 'adresse', 'address']

@field_validator('*')
def validate_no_pii(cls, v, info):
    field_name = info.field_name
    if any(f in field_name.lower() for f in forbidden_keys):
        raise ValueError('PII not allowed')
    return v
```

3. **Sanitisation des chaînes**
```python
@field_validator('enfant_id')
def sanitize_string(cls, v):
    return re.sub(r'[^\w\-]', '', v)
```

### 6. Sécurité des Communications

**HTTPS obligatoire:**
- Configuration Nginx/Apache avec SSL/TLS
- Certificats Let's Encrypt ou auto-signés en dev

**Headers de sécurité:**
```python
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000"
    return response
```

### 7. Gestion des Secrets

**Variables d'environnement:**
```bash
# .env (jamais commité)
JWT_PRIVATE_KEY=file://./storage/jwt/private.pem
JWT_PUBLIC_KEY=file://./storage/jwt/public.pem
TELERIVET_API_KEY=sk_live_xxxxx
DATABASE_PASSWORD=secure_password
API_TOKEN=change-me-in-production
```

**Fichier `.env.example`:**
```bash
JWT_ALGO=RS256
JWT_TTL=15
TELERIVET_PROJECT_ID=your_project_id
TELERIVET_ROUTE_ID=your_route_id
```

---

## Conformité RGPD

### Article 22: Décisions Automatisées

**Exigence:** Informer les individus des décisions automatisées et permettre l'intervention humaine.

**Implémentation:**

1. **Audit logging complet**
   - Chaque prédiction est loggée avec request_id unique
   - Hash de l'enfant_id pour anonymisation
   - Timestamp, IP, User-Agent
   - Score, niveau_risque, confiance, version_modele

2. **Endpoint d'accès aux données**
```python
@app.get("/audit/logs")
@limiter.limit("60/minute")
async def get_audit_logs(request: Request):
    return {
        "total_entries": len(audit_log),
        "logs": audit_log[-100:]
    }
```

3. **Explicabilité des décisions**
```python
"facteurs_explicatifs": {
    "impact_retard": "Fort" if retards > 10 else "Faible",
    "impact_distance": "Fort" if distance > 30 else "Faible",
    "impact_absence": "Fort" if absences >= 2 else "Faible"
}
```

### Minimisation des Données

**Principe:** Ne collecter que les données nécessaires.

**Implémentation:**
- Filtrage PII côté IA
- Hash des identifiants dans les logs
- Aucune donnée personnelle dans les réponses

### Droit à l'Oubli

**Capacité future:**
- Suppression des logs d'audit sur demande
- Réentraînement du modèle sans les données concernées

### Traçabilité

**Request IDs uniques:**
```python
request_id = str(uuid.uuid4())
```

Permet de retracer:
- La requête originale
- La prédiction générée
- Les logs d'audit correspondants

---

## Évolutions Futures Possibles

### 1. Passage à un Vrai Modèle ML

**Dataset requis:**
- Historique des vaccinations
- Données démographiques
- Données géographiques
- Résultats des rappels SMS

**Algorithmes candidats:**
- **Random Forest**: Interprétable, robuste
- **XGBoost**: Haute performance
- **Réseau de neurones**: Pour données complexes

**Pipeline d'entraînement:**
```python
# ml/training/train.py (à implémenter)
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import metrics

def train_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)
    
    # Évaluation
    y_pred = model.predict(X_test)
    accuracy = metrics.accuracy_score(y_test, y_pred)
    
    return model, accuracy
```

### 2. Feature Engineering Avancé

**Nouvelles features possibles:**
- Saisonalité des vaccinations
- Profil socio-économique (anonymisé)
- Historique des communications SMS
- Patterns de mobilité

### 3. Explicabilité avec SHAP

**Implémentation future:**
```python
import shap

def explain_prediction(model, features):
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(features)
    return shap_values
```

### 4. Monitoring en Production

**Métriques à surveiller:**
- Drift des données
- Performance du modèle
- Latence des prédictions
- Taux d'erreurs

**Outils:**
- Prometheus + Grafana
- MLflow
- Evidently AI

### 5. A/B Testing

**Tester différentes versions:**
- Modèle heuristique vs ML
- Différents seuils de risque
- Différentes stratégies de communication

---

## Résumé Technique

### Stack Technique Actuelle

**Backend API (Laravel):**
- PHP 8.x
- Laravel 10.x
- JWT Auth avec RS256
- MySQL
- Redis

**Service IA (Python):**
- Python 3.12
- FastAPI
- Pydantic
- Uvicorn
- Redis (optionnel)

**Frontend (Next.js):**
- React 18
- Next.js 14
- TypeScript
- TailwindCSS

### Points Forts de l'Architecture

1. **Séparation des responsabilités**: API Laravel et Service IA indépendants
2. **Sécurité multicouche**: Auth, Rate limiting, Validation, Audit
3. **Scalabilité**: Chaque service peut être scalé indépendamment
4. **Observabilité**: Logs d'audit, monitoring, health checks
5. **Conformité RGPD**: Anonymisation, traçabilité, explicabilité

### Limitations Actuelles

1. **Modèle heuristique**: Pas de véritable apprentissage
2. **Dataset limité**: Pas de données historiques pour l'entraînement
3. **Explicabilité basique**: Règles simples vs SHAP
4. **Monitoring basique**: Pas de drift detection

---

## Conclusion

Le système Vaccin-Track utilise actuellement une approche heuristique pour l'évaluation des risques de non-vaccination. Cette approche offre une interprétabilité totale et une maintenance simplifiée, tout en respectant les exigences de sécurité et de conformité RGPD.

Les fondations sont solides pour une évolution vers un véritable système de Machine Learning lorsque les données seront disponibles. L'architecture modulaire et les stratégies de sécurité en place faciliteront cette transition.

---

**Document version:** 1.0  
**Date de création:** 16 août 2026  
**Auteur:** Système Vaccin-Track  
**Statut:** Production
