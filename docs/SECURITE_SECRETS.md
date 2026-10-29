# Gestion des secrets — SNSC-MALI

## Clés JWT

Les clés privées ne doivent jamais être commitées dans Git, placées dans le frontend, les journaux ou les artefacts partagés. Le fichier `apps/api/scripts/ensure-jwt-keys.php` génère une paire RSA de 3072 bits dans `apps/api/storage/jwt/` si et seulement si les deux fichiers sont absents. Si une seule clé existe, le script s'arrête pour éviter de créer une paire incohérente. La clé privée reçoit les permissions `0600`; la clé publique reçoit `0644`.

Les fichiers PEM sous `apps/api/storage/` sont ignorés par Git, quel que soit le sous-répertoire. Chaque environnement doit posséder sa propre paire. La paire générée par le script est une option de développement; en production, privilégier un gestionnaire de secrets et une procédure contrôlée de rotation.

**Important :** retirer une clé du dernier état du dépôt ne l'efface pas des anciens commits. Le dépôt contenait plusieurs copies de clés dans deux chemins historiques; elles ont été retirées de la branche de travail. Si une clé privée a déjà été poussée vers un dépôt partagé ou public, considérer cette clé comme compromise : générer une nouvelle paire, déployer la nouvelle configuration, révoquer les sessions/tokens concernés et évaluer avec les responsables du dépôt la suppression de l'historique sensible. Une réécriture d'historique doit être coordonnée, car elle modifie les références Git et les clones existants.

## Démarrage local

1. Copier `.env.example` en `.env` à la racine.
2. Remplacer `POSTGRES_PASSWORD` par une valeur aléatoire forte.
3. Lancer `docker compose up -d`; le service API copie `apps/api/.env.example` vers `apps/api/.env` si le fichier local n'existe pas.
4. Les variables DB de l'environnement Docker utilisent le même `POSTGRES_PASSWORD` que PostgreSQL.
5. Ne jamais commiter les fichiers `.env` réels ou les clés générées.

Le point d'accès `/audit/logs` reste désactivé tant que `AUDIT_LOGS_TOKEN` n'est pas défini. En production, la route doit être limitée au réseau d'administration et le secret doit être fourni par le gestionnaire de secrets.

Cette documentation ne remplace pas un audit de déploiement ni la rotation d'une clé déjà exposée.
