# BA NI DEN KƐNƐYA / MALI — état d'implémentation et prochaines étapes

**Branche de travail :** `feat/ba-ni-den-keneya-hardening`  
**Branche de référence :** `main` au commit `e7f044cb8865663b9b07e625c350e2fc338c751c` (28 octobre 2026)  
**Référence fonctionnelle :** Lean Canvas renforcé BA NI DEN KƐNƐYA / MALI, version de travail du 22 octobre 2026.

Ce document décrit uniquement les changements et les limites constatés dans cette tranche. Il ne certifie pas une aptitude à l'utilisation clinique ou à un déploiement institutionnel.

## 1. Changements livrés sur la branche

### API et interface de suivi prénatal

- Ajout de `MesureCliniqueController`, avec lecture paginée et création d'une mesure rattachée à une grossesse.
- Ajout des routes `GET/POST /api/v1/grossesses/{grossesse}/mesures`.
- Les mesures sont attribuées à la structure de la grossesse. Un accès inter-structure est refusé par `AccesParStructureService`.
- Toute nouvelle mesure reçoit `statut_validation = A_VERIFIER`. Le contrôleur ne convertit pas une mesure en diagnostic et ne déclenche aucun seuil clinique.
- La page `apps/web/src/app/agent/grossesses/[id]/page.tsx` permet de saisir type, valeur, unité, date/heure et méthode, puis d'afficher l'historique.

### Suivi post-partum

- La page `apps/web/src/app/agent/meres/[id]/page.tsx` permet désormais de saisir la date, le type de contact, une note structurée, une orientation et un prochain rendez-vous.
- Le suivi est transmis au endpoint `POST /api/v1/meres/{mere}/suivis-postpartum`, reste à vérifier (`A_VERIFIER`) et apparaît dans la chronologie mère-enfant.
- `PostpartumController` vérifie le périmètre de l'épisode d'accouchement avant d'associer ce dernier au suivi, et refuse une liaison vers une autre structure.

### Consentement

- `ConsentementController` vérifie que la mère appartient au centre où le consentement est enregistré.
- Pour un tuteur, le contrôleur vérifie qu'au moins un dossier enfant relié à ce tuteur existe dans le centre indiqué.
- Une structure doit être déterminée ; un centre absent n'est plus traité comme une autorisation implicite.
- Le retrait répété d'un consentement déjà retiré devient idempotent.
- `RelanceService` revérifie le consentement immédiatement avant l'appel au service SMS, pour réduire la fenêtre où un retrait concurrent serait ignoré.

### Références de soins

- Le contrôleur vérifie que la structure émettrice et la structure destinataire sont différentes.
- Lorsqu'une grossesse est associée à une référence concernant une mère, le lien entre la grossesse et cette mère est contrôlé.
- Pour une référence de type grossesse, `grossesse_id` doit correspondre à `patient_id`.
- Le parcours de transitions existant reste utilisé ; aucune référence urgente n'est censée remplacer l'appel ou le transfert humain requis par un protocole local.

### Synchronisation mobile — amélioration ciblée, pas encore hors ligne complet

- Le rejeu exact d'un événement reçoit `DEJA_RECU`.
- La réutilisation d'un identifiant ou d'une clé d'idempotence avec un contenu différent reçoit `CONFLIT`.
- La réponse évite de révéler les événements d'un autre centre et n'écrit pas le payload clinique brut dans les logs.
- Les états de réponse rendent explicite le fait qu'un événement est seulement enregistré dans le journal.

**Limite importante :** la route `POST /api/v1/mobile/sync` ne répercute pas encore le contenu des événements dans les tables métier. Elle n'en conserve que les métadonnées et le hash du payload. `RECU_A_TRAITER` signifie donc réception/journalisation, pas mise à jour du dossier mère, de la grossesse, de la vaccination ou de la référence. Le mécanisme de synchronisation métier hors ligne demeure un travail à réaliser.

## 2. Tests ajoutés ou mis à jour

Dans `apps/api/tests/Feature/MaternalCareApiTest.php` :

- parcours mère → grossesse → contact prénatal avec isolation par structure ;
- transitions de référence entre une structure émettrice et une structure destinataire ;
- rejeu d'une synchronisation et résultat de réception ;
- conflit lorsqu'une clé existante est réutilisée avec un payload différent ;
- enregistrement/lecture d'une mesure clinique et interdiction de lecture depuis un autre centre ;
- interdiction d'enregistrer le consentement d'une mère hors du périmètre de l'agent ;
- création d'un suivi post-partum présent dans la chronologie ;
- refus d'associer un suivi à un épisode d'accouchement d'une autre structure.

Les workflows GitHub Actions ont été renforcés pour exécuter des contrôles réels plutôt que la seule étape `checkout` : tests Laravel ciblés, vérification TypeScript/lint/build Next.js, compilation Python et tests IA. Sur le commit `a664c758`, les tests ciblés Laravel terminent avec succès et 52 assertions, mais PHPUnit signale 9 avertissements liés notamment à des appels `file_get_contents` de l'environnement de test. Le diagnostic non bloquant de l'ensemble historique de tests reste en échec : 16 tests échouent, 28 avertissements et 4 réussites, principalement parce que des tests historiques utilisent des modèles/factories (`App\\Models\\Enfant`, `Vaccin::factory()`, etc.) absents ou divergents du modèle courant. Ces échecs ne sont pas présentés comme corrigés par cette branche.

## 3. Commandes de vérification locale

Depuis la racine du dépôt :

```bash
# API Laravel
cd apps/api
composer install
php artisan config:clear
php artisan test --filter=MaternalCareApiTest

# Frontend
cd ../web
npm ci
npx tsc --noEmit
npm run lint
npm run build

# Service IA
cd ../ia
python -m pip install -r requirements.txt
python -m compileall -q app
python -m pytest -q tests
```

Utiliser une base de test isolée et des données fictives. Ne pas exécuter les tests `RefreshDatabase` contre une base contenant des données réelles.

## 4. Écarts non résolus avec le Lean Canvas

### Priorité immédiate

1. **Synchronisation réellement opérationnelle :** définir et versionner les contrats d'événement, stocker le payload avec une protection appropriée, valider chaque événement, appliquer les opérations métier dans une transaction, gérer les conflits et fournir un curseur de pull stable. Ne pas traiter l'empreinte hash comme un mécanisme de synchronisation complet.
2. **Mesures et référentiels cliniques :** remplacer les libellés libres par un catalogue contrôlé après validation clinique ; définir unités, provenance, dates, contrôle de cohérence, correction et validation humaine.
3. **Autorisations et parcours complets :** étendre les tests négatifs aux listes, détails, recherches, exports, mesures, références, consentements, synchronisation et relations mère-enfant. Auditer également les opérations de modification/suppression.
4. **Vérification d'intégration :** lancer les tests automatisés et corriger les erreurs révélées avant d'étendre le schéma.

### Étape suivante — dossier longitudinal complet

- Compléter les capacités post-partum : affichage de l'historique détaillé, révision/correction avec audit, association contrôlée à un épisode d'accouchement et planification opérationnelle des prochaines visites.
- Fournir une chronologie unifiée couvrant consultations, mesures, accouchement, post-partum, nouveau-né et vaccination ; afficher la provenance et le statut de validation.
- Définir le workflow opérationnel de référence/contre-référence, la responsabilité de suivi, les délais et les règles d'escalade selon les procédures validées.
- Compléter les rappels mère-enfant par consentement, langue et messages discrets ; suivre les statuts d'envoi/livraison et le retrait.

### Étape IA — après validation des fondations

Le modèle `apps/ia/app/models/risque_model.py` reste une heuristique orientée vers le retard vaccinal. Il ne doit pas être réutilisé comme modèle obstétrical ou fœtal. Le service `explainer.py` doit être complété, et les règles cliniques versionnées doivent venir de protocoles officiellement validés. Toute nouvelle IA materno-fœtale exige données autorisées, validation locale, analyse des faux négatifs, mode silencieux, revue humaine et procédure d'arrêt.

### Gouvernance institutionnelle

- Cartographier les traitements et conduire l'analyse de protection des données requise par les responsables juridiques.
- Valider les rôles et périmètres, le MFA des comptes sensibles, la conservation, les sauvegardes et la restauration.
- Documenter les interfaces autorisées avec les référentiels et systèmes institutionnels ; ne pas créer de registre statistique concurrent.
- Mesurer une baseline avant de fixer des cibles chiffrées. Ne pas publier de métriques de performance clinique sans définitions, dénominateurs et validation.

## 5. Critères avant tout pilote

- Les contrôles d'accès par centre passent les tests négatifs.
- Les migrations s'exécutent sur une base de test vide et les tests existants ne régressent pas.
- La synchronisation prouve l'application métier idempotente, la reprise, les conflits et l'absence de perte silencieuse.
- Les consentements et les retraits sont respectés au moment de chaque communication.
- Un professionnel habilité valide les données cliniques et les protocoles ; l'IA ne remplace jamais la conduite à tenir en cas d'urgence.
- Les équipes, sauvegardes, supervision, support et mécanisme de suspension sont opérationnels.

**Conclusion :** cette branche avance le suivi prénatal, le contrôle de périmètre et la traçabilité. Elle ne constitue pas encore une plateforme materno-infantile prête pour un pilote clinique : la synchronisation métier, la validation clinique, les tests d'intégration et la gouvernance restent des jalons obligatoires.
