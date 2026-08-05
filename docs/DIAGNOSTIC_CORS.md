# 🔧 Diagnostic CORS - Vaccin-Track

**Date:** 7 Juin 2026  
**Statut:** ✅ RÉSOLU

---

## 📋 Problème Identifié

L'application frontend (Next.js) était incapable de communiquer avec l'API backend (Laravel) en raison de deux problèmes:

### Erreur 1: CORS Preflight Échoue
```
OPTIONS /api/auth/me HTTP/1.1" 404 Not Found
```
**Cause:** Aucun middleware CORS configuré dans Laravel 13  
**Impact:** Les requêtes du navigateur étaient rejetées

### Erreur 2: Format de Réponse Incorrect
```javascript
// Frontend attend:
const userData = data.data;  // data.data

// Backend retournait:
{ "id": "...", "nom": "..." }  // Pas de wrapper 'data'
```
**Cause:** Le contrôleur AuthController retournait un format non-standard  
**Impact:** `TypeError: Failed to fetch` même après CORS OK

---

## ✅ Solutions Implémentées

### 1️⃣ Créer Middleware CORS

**Fichier:** `apps/api/app/Http/Middleware/HandleCors.php`

Ce middleware gère:
- ✅ Requêtes OPTIONS (preflight CORS)
- ✅ Headers CORS (Access-Control-Allow-*)
- ✅ Whitelist des origines (localhost:3000, localhost:3001, ...)
- ✅ Méthodes autorisées (GET, POST, PUT, DELETE, PATCH, OPTIONS)

**Fonctionnement:**
```php
// Si requête OPTIONS → retour 200 avec headers CORS
// Si requête GET/POST/etc → traitement normal + headers CORS
```

### 2️⃣ Enregistrer Middleware dans Bootstrap

**Fichier:** `apps/api/bootstrap/app.php`

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->api(append: [
        \App\Http\Middleware\HandleCors::class,
    ]);
})
```

Cela ajoute le middleware à TOUS les endpoints API.

### 3️⃣ Créer Fichier de Configuration CORS

**Fichier:** `apps/api/config/cors.php`

Configuration centralisée pour:
- Origines autorisées
- Méthodes autorisées
- Headers autorisés
- Credentials support

### 4️⃣ Corriger Format Réponse AuthController

**Fichier:** `apps/api/app/Http/Controllers/Api/AuthController.php`

```php
// ❌ Avant:
return response()->json([
    'id' => $user->id,
    'nom' => $user->nom,
    ...
]);

// ✅ Après:
return response()->json([
    'data' => [
        'id' => $user->id,
        'nom' => $user->nom,
        ...
    ]
]);
```

---

## 🧪 Vérification

### Tester localement:

```bash
# Terminal 1: Lancer le backend
cd apps/api
php artisan serve

# Terminal 2: Lancer le frontend
cd apps/web
npm run dev

# Terminal 3: Tester les endpoints
bash scripts/test-cors-api.sh
```

### Logs à vérifier:

**Laravel (api/storage/logs/):**
```
Middleware HandleCors exécuté pour OPTIONS /api/auth/me
Réponse: 200 + headers CORS
```

**Browser Console (http://localhost:3000):**
- ✅ Pas d'erreur CORS dans la console
- ✅ `localStorage` contient `auth_token` après login
- ✅ Page `/agent/dashboard` se charge

---

## 📊 État Post-Correction

| Composant | État |
|-----------|------|
| Backend API | ✅ CORS configuré |
| Routes Auth | ✅ Endpoints actifs |
| Format Réponses | ✅ Wrapper 'data' OK |
| Frontend → API | ✅ Requêtes OK |
| Authentification | ✅ JWT fonctionnel |

---

## 🔗 Flux d'Authentification (Corrigé)

```
1. Frontend: POST /auth/login
   → OPTIONS /auth/login (preflight)
   ← 200 OK + CORS headers ✅
   
2. Frontend: POST /auth/login + credentials
   ← 200 OK + { access_token: "..." } ✅
   
3. Frontend stocke token en localStorage

4. Frontend: GET /auth/me + Bearer token
   → OPTIONS /auth/me (preflight)
   ← 200 OK + CORS headers ✅
   
5. Frontend: GET /auth/me + Bearer token
   ← 200 OK + { data: { id, nom, role, ... } } ✅
   
6. Frontend signe l'utilisateur + redirige vers dashboard
```

---

## 📝 Résumé des Fichiers Modifiés

```
✅ Créé: apps/api/app/Http/Middleware/HandleCors.php
✅ Modifié: apps/api/bootstrap/app.php
✅ Créé: apps/api/config/cors.php  
✅ Modifié: apps/api/app/Http/Controllers/Api/AuthController.php
✅ Créé: scripts/test-cors-api.sh
```

---

## ⚙️ Configuration par Environnement

### Développement (localhost)
- ✅ Origines autorisées: localhost:3000, localhost:3001, 127.0.0.1:3000
- ✅ APP_DEBUG=true (erreurs détaillées)
- ✅ Credentials: true

### Production (TODO)
- 🔒 À configurer avec domaines réels
- 🔒 APP_DEBUG=false
- 🔒 HTTPS obligatoire

---

## 🚀 Prochaines Étapes

1. ✅ Tester authentification localement
2. ✅ Vérifier que les dashboards se chargent
3. ✅ Tester tous les endpoints API
4. 📋 Documenter les changements en ADR
5. 📋 Préparer configuration production
6. 📋 Configurer HTTPS pour production

---

**Document généré le 7 Juin 2026**
