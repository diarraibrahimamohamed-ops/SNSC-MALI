# Configuration JWT Sécurisée

## Variables d'environnement à ajouter dans `.env`

Ajoutez ces lignes à votre fichier `apps/api/.env`:

```bash
# JWT Configuration - Algorithme asymétrique RS256
JWT_ALGO=RS256
JWT_TTL=15
JWT_REFRESH_TTL=20160
JWT_REFRESH_IAT=false

# Chemins vers les clés RSA générées
JWT_PUBLIC_KEY=file://./storage/jwt/public.pem
JWT_PRIVATE_KEY=file://./storage/jwt/private.pem
JWT_PASSPHRASE=

# Blacklist sur Redis
JWT_BLACKLIST_ENABLED=true
JWT_BLACKLIST_GRACE_PERIOD=0
JWT_SHOW_BLACK_LIST_EXCEPTION=true
```

## Clés RSA générées

Les clés ont été générées dans:
- Clé privée: `apps/api/storage/jwt/private.pem` (chmod 600)
- Clé publique: `apps/api/storage/jwt/public.pem` (chmod 644)

## Modifications apportées

1. **Algorithme JWT**: HS256 → RS256 (clés asymétriques)
2. **TTL réduit**: 60 minutes → 15 minutes
3. **Storage**: Illuminate → Redis (pour la blacklist)
