# 📋 ARCHITECTURE FRONTEND - VACCIN-TRACK MALI

## 🏗️ STRUCTURE CLAIRE ET SANS CONFUSION

### 📁 **DOSSIERS PRINCIPAUX**
```
apps/web/src/app/
├── (auth)/                    # Authentification ADMIN uniquement
│   ├── layout.tsx            # Layout auth admin
│   └── login/page.tsx        # Login admin (/login)
├── (admin)/                   # Espace ADMINISTRATEUR
│   ├── layout.tsx            # Layout admin
│   ├── agents/page.tsx       # Gestion agents (/admin/agents)
│   ├── audit/page.tsx        # Audit (/admin/audit)
│   ├── centres/page.tsx      # Centres santé (/admin/centres)
│   ├── dashboard/page.tsx    # Dashboard admin (/admin/dashboard)
│   └── utilisateurs/page.tsx # Utilisateurs (/admin/utilisateurs)
├── (agent)/                   # Espace AGENT DE SANTÉ
│   ├── layout.tsx            # Layout agent
│   ├── dashboard/page.tsx    # Dashboard agent (/agent/dashboard)
│   └── enfants/page.tsx      # Gestion enfants (/agent/enfants)
├── agent-auth/               # Authentification AGENT uniquement
│   └── page.tsx             # Login agent (/agent-auth)
├── register/                 # Page refus auto-enregistrement
│   └── page.tsx             # Accès refusé (/register)
├── layout.tsx               # Layout racine
├── page.tsx                 # Page d'accueil (/)
└── globals.css              # Styles globaux
```

## 🔐 **SYSTÈME D'AUTHENTIFICATION**

### 👤 **ADMINISTRATEUR**
- **Login**: `/login` → Dashboard admin
- **Dashboard**: `/admin/dashboard`
- **Gestion agents**: `/admin/agents` (crée les comptes agents)
- **Aucun auto-enregistrement** ✅

### 👨‍⚕️ **AGENT DE SANTÉ**
- **Login**: `/agent-auth` → Dashboard agent
- **Dashboard**: `/agent/dashboard`
- **Pas d'auto-enregistrement** ✅
- **Compte créé par admin** ✅

### 🚫 **AUTO-ENREGISTREMENT**
- **Page `/register`**: Affiche "Accès refusé" + redirection
- **Aucune inscription publique** ✅

## 📊 **FONCTIONNALITÉS PAR RÔLE**

### 🎯 **ADMINISTRATEUR**
```
✅ Gestion des agents (création, modification, suppression)
✅ Dashboard avec statistiques globales
✅ Gestion des centres de santé
✅ Audit et rapports
✅ Configuration système
❌ Auto-enregistrement (désactivé)
```

### 👨‍⚕️ **AGENT DE SANTÉ**
```
✅ Dashboard personnel avec ses statistiques
✅ Gestion des enfants assignés
✅ Planification des vaccinations
✅ Suivi des rendez-vous
✅ Envoi de rappels SMS
❌ Gestion des autres agents (non autorisé)
❌ Auto-enregistrement (désactivé)
```

## 🔄 **FLOW D'UTILISATION**

### 📋 **FLOW ADMIN**
1. Admin → `/login` → Authentification
2. Redirection → `/admin/dashboard`
3. Menu "👤 Agents" → `/admin/agents`
4. Créer un agent → Email/mot de passe générés
5. Donner les identifiants à l'agent

### 📋 **FLOW AGENT**
1. Agent → `/agent-auth` → Authentification
2. Redirection → `/agent/dashboard`
3. Travail quotidien (vaccinations, RDV, etc.)

## 🎨 **DESIGN ET STYLING**

### 🎯 **ADMINISTRATEUR**
- **Couleurs**: Émeraude/Teal (vert)
- **Sidebar**: Navigation complète
- **Dashboard**: Statistiques globales

### 👨‍⚕️ **AGENT**
- **Couleurs**: Bleu/Indigo
- **Sidebar**: Navigation limitée
- **Dashboard**: Statistiques personnelles

## 🚀 **URLS FINALES**

### 📱 **PAGES PUBLIQUES**
- Accueil: `/`
- Login admin: `/login`
- Login agent: `/agent-auth`
- Refus auto-enregistrement: `/register`

### 🏢 **ESPACE ADMIN**
- Dashboard: `/admin/dashboard`
- Agents: `/admin/agents`
- Centres: `/admin/centres`
- Audit: `/admin/audit`
- Utilisateurs: `/admin/utilisateurs`

### 👨‍⚕️ **ESPACE AGENT**
- Dashboard: `/agent/dashboard`
- Enfants: `/agent/enfants`

## ⚠️ **RÈGLES IMPORTANTES**

1. **PAS DE CONFLIT DE ROUTES** ✅
2. **PAS D'AUTO-ENREGISTREMENT** ✅
3. **SÉPARATION CLAIRE DES RÔLES** ✅
4. **DESIGN DIFFÉRENTIÉ** ✅
5. **FONCTIONNALITÉS SPÉCIFIQUES** ✅

## 🔧 **POUR LES DÉVELOPPEURS FRONTEND**

### 📁 **OÙ TRAVAILLER**
- **Admin**: `src/app/(admin)/`
- **Agent**: `src/app/(agent)/`
- **Auth**: `src/app/(auth)/` et `src/app/agent-auth/`

### 🎨 **STYLING**
- **CSS intégré** dans les layouts
- **Pas de dépendance externe** à Tailwind CSS
- **Classes CSS personnalisées**

### 🔐 **SÉCURITÉ**
- **LocalStorage** pour les sessions (demo)
- **Pas de mots de passe en dur** dans le code
- **Validation côté client** + serveur

---

*Architecture finale claire, sans confusion et prête pour le développement frontend* 🚀
