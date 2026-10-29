# Plan d'évolution du suivi maternel — SNSC-MALI

**Branche de travail :** `feature/maternite-suivi-prenatal`  
**Statut :** cadrage fonctionnel — les éléments de ce document ne signifient pas que toutes les fonctions décrites sont implémentées.

## 1. État de départ vérifié

Le dépôt expose déjà des routes Laravel pour les mères, grossesses, contacts prénataux, mesures cliniques, épisodes d'accouchement, suivi post-partum, consentements, références et synchronisation. Les modèles concernés comprennent notamment `PersonneMere`, `Grossesse`, `ContactPrenatal`, `MesureClinique`, `EpisodeAccouchement` et `SuiviPostPartum`.

Le service FastAPI observé dans `apps/ia/app/models/risque_model.py` contient actuellement une heuristique de risque de discontinuité vaccinale. Il ne constitue pas un modèle obstétrical validé. Aucune prédiction fœtale ou de complication d'accouchement n'a été identifiée dans les fichiers IA examinés.

Les noms et chemins ci-dessus sont le point de départ observé dans le code; les fonctions doivent encore être testées en exécution avant d'être considérées comme opérationnelles.

## 1.1 Première tranche implémentée sur la branche de travail

La première tranche de code ajoute un registre structuré de résultats d'examens prénataux :

- Migration : `resultats_examens_prenataux`, avec liens vers la grossesse, le contact prénatal éventuel et la structure sanitaire.
- Modèle Laravel : `ResultatExamenPrenatal`.
- API authentifiée : `GET /api/v1/grossesses/{grossesse}/examens` et `POST /api/v1/grossesses/{grossesse}/examens`.
- Interface agent : formulaire progressif et historique des examens dans le détail d'une grossesse.
- Validation : statut du résultat, unité facultative, dates cohérentes, source et statut de vérification; l'API vérifie également le périmètre de structure et que le contact lié appartient à la même grossesse.
- Tests : création/liste des examens, cloisonnement entre structures, absence de résultat pour un examen déclaré disponible et incohérence chronologique.

Cette tranche **n'est pas** un référentiel national complet d'examens, ne calcule pas d'interprétation clinique et ne constitue pas une prédiction. Les codes et catégories saisis restent à harmoniser au moyen d'un référentiel versionné approuvé par les responsables métier.

Les workflows GitHub de la branche doivent être consultés avant chaque fusion; un résultat vert ne remplace pas la validation fonctionnelle par les utilisateurs visés.

## 1.2 Deuxième tranche implémentée sur la branche de travail

Le registre de symptômes déclarés et un catalogue de mesures maternelles ont été ajoutés :

- API authentifiée pour consulter le catalogue de symptômes prénataux.
- Enregistrement d'un symptôme avec statut (`SIGNALE`, `NON_SIGNALE`, `NON_EVALUE`), source de déclaration, date, début estimé éventuel, intensité déclarée facultative et observations.
- Contrôles de cohérence temporelle et validation de la source; un symptôme `AUTRE` doit être précisé.
- Historique dans le détail d'une grossesse et intégration à la chronologie longitudinale Mère–Enfant.
- Catalogue de mesures courantes : poids maternel, tensions systolique/diastolique, température, fréquence cardiaque/respiratoire, saturation et hauteur utérine.
- Choix de mesure et unité suggérée depuis l'interface. Les contrôles côté API sur les unités et limites très larges servent à repérer les erreurs de saisie; **ce ne sont pas des seuils cliniques**.
- Tests ajoutés pour l'isolation inter-centres, la cohérence des données et l'intégration des symptômes dans la chronologie.

Les listes proposées constituent un catalogue initial à faire valider par l'équipe métier. L'intensité est une déclaration subjective, pas une évaluation clinique. Une absence de déclaration n'est jamais inférée à partir d'un champ vide. Aucun score, diagnostic, triage ni recommandation de traitement n'est généré par cette tranche.

## 1.3 Troisième tranche implémentée sur la branche de travail

- Registre d'antécédents obstétricaux rattaché au dossier mère, avec type, date éventuelle, source, précision, observations et statut de vérification.
- Catalogue initial d'antécédents : prématurité, césarienne, mortinaissance, décès néonatal, complications obstétricales déclarées, grossesse multiple, fausse couche, transfert et autre.
- Routes authentifiées de consultation et d'enregistrement; vérification du périmètre de structure; journalisation minimale.
- Intégration des antécédents dans la chronologie longitudinale Mère–Enfant.
- Ajout du champ « prochain rendez-vous prévu » au formulaire de contact prénatal existant et affichage de la date sur le contact enregistré.
- Tests d'intégration du registre, de l'accès inter-centres, de la validation du code « autre » et du rendez-vous prénatal.

Les antécédents sont conservés comme déclarés ou transcrits; le statut reste `A_VERIFIER`. Les listes sont un catalogue initial à valider avec les professionnels métier. Le système ne calcule ni gravité, ni risque individuel, ni conduite clinique à partir de ces antécédents.

## 1.4 Quatrième tranche implémentée sur la branche de travail

- Nouveau calendrier structuré lié à une grossesse et à une structure : date prévue, type, libellé, statut et note administrative.
- Transitions contrôlées : `PLANIFIE` vers `REALISE`, `MANQUE`, `ANNULE` ou `REPORTE`. Un report ferme l'enregistrement initial et crée un remplacement lié, dans une transaction.
- Liste filtrable et paginée des rendez-vous, consultation au niveau d'une grossesse et affichage dans la chronologie mère-enfant.
- Planification d'un rappel SMS et suivi minimal de son état.
- Commande `maternite:rappels-prenataux` planifiée toutes les dix minutes par Laravel Scheduler; envoi uniquement avec consentement explicite actif `SMS_RENDEZ_VOUS`, téléphone disponible et fournisseur configuré.
- Message SMS volontairement générique, qui ne mentionne pas la grossesse ni les informations cliniques.
- Les rappels sans consentement sont consignés comme ignorés; le système ne déduit jamais un consentement du simple fait qu'un numéro de téléphone existe.
- Tests de structure, de report, de refus d'un rendez-vous futur déclaré manqué, et d'envoi/non-envoi SMS selon le consentement.

La mise en route requiert l'application explicite des migrations et l'exécution du scheduler. L'envoi est contrôlé par lot et observable; comme tout fournisseur externe, une interruption après acceptation par le fournisseur mais avant persistance de l'état peut créer un risque de doublon au redémarrage. Un déploiement de production devra vérifier les mécanismes d'idempotence disponibles auprès du fournisseur et superviser les états `EN_COURS`/échec.

## 1.5 Cinquième tranche implémentée sur la branche de travail

- Table et modèle `ReferentielExamenPrenatal`, avec version de protocole, code unique par version, catégorie, modalité, fenêtre gestationnelle indicative et référence documentaire.
- Publication d'une définition réservée au rôle administrateur; une correction ou évolution de protocole doit être publiée sous une nouvelle version.
- Vue par grossesse : renvoie les définitions correspondant à la version du dossier et, si disponible, à la fenêtre gestationnelle calculée à partir de la date de début estimée; indique seulement si un résultat est enregistré pour le code correspondant.
- Si aucune version n'est renseignée ou si aucune définition n'existe, l'API renvoie un état explicite au lieu d'inférer qu'aucun examen n'est nécessaire.
- Interface agent : affichage de la référence, de la fenêtre configurée, de la version et du statut d'enregistrement.
- Tests d'autorisation administrateur, d'unicité des codes par version, de lecture du référentiel et de liaison avec les résultats de la grossesse.

Aucune liste nationale n'est préchargée, car les définitions, fenêtres et références doivent être validées avant usage réel. Le calcul gestationnel est présenté comme estimation technique à vérifier, pas comme une donnée clinique confirmée.

## 2. Principes de conception

1. **Continuité Mère–Grossesse–Accouchement–Enfant :** une mère peut avoir plusieurs grossesses; chaque grossesse possède son historique, son issue et les liens vers les nouveau-nés concernés.
2. **Saisie progressive :** ne pas demander à un agent de remplir un long formulaire unique à chaque contact. Afficher les champs utiles à l'étape courante, conserver les données déjà connues et distinguer « inconnu », « non renseigné », « non réalisé » et « non applicable ».
3. **Provenance et traçabilité :** pour chaque donnée importante, conserver la source, la date de collecte, l'auteur, l'unité et le statut de vérification si pertinent.
4. **Séparation des finalités :** le suivi opérationnel, l'information de sécurité et la recherche prédictive ont des responsabilités distinctes.
5. **Configuration versionnée :** les calendriers de suivi et référentiels d'examens doivent être paramétrables et versionnés selon les protocoles sanitaires approuvés, plutôt que figés dans le code.
6. **Précaution clinique :** l'application ne remplace pas l'évaluation d'un professionnel, ne prescrit pas de traitement et ne laisse jamais un score statistique masquer un signe d'alerte reconnu.
7. **Adaptation au terrain :** prévoir progressivement l'usage hors connexion, la synchronisation idempotente, les SMS sobres en informations sensibles, et une interface adaptée aux structures disposant de ressources limitées.

## 3. Modules métier cibles

### 3.1 Dossier mère et antécédents
- Identifiant sanitaire et mécanisme de détection des doublons.
- Date de naissance ou âge, localité/aire de santé, langue préférée et contacts lorsque disponibles.
- Antécédents obstétricaux structurés : grossesses/accouchements précédents, césarienne, prématurité, mortinaissance et complications antérieures documentées.
- Source, auteur, date de collecte et droits d'accès.
- Pas de réutilisation de données pour la recherche sans finalité et base juridique définies.

### 3.2 Dossier de grossesse
- Datation estimée, méthode/source de datation et niveau d'incertitude.
- Âge gestationnel calculable à partir d'une référence datée; conservation de la valeur source et des corrections.
- Terme estimé, grossesse multiple si documentée, structure responsable et statut.
- Contacts prénataux, observations, mesures, examens, rendez-vous, références et événements associés.

### 3.3 Contacts prénataux
- Date, âge gestationnel, type de contact, structure, auteur et provenance.
- Historique des paramètres maternels, notamment poids et tension artérielle lorsque mesurés.
- Symptômes déclarés et observations saisies par le personnel, clairement différenciés.
- Prochaine échéance et statut de réalisation.
- Distinction entre valeur absente, mesure non réalisée, résultat en attente et résultat vérifié.

### 3.4 Examens
- Référentiel versionné d'examens et de résultats possibles.
- Résultat, unité, date de prélèvement/mesure, date de résultat, laboratoire/source, statut de validation et pièce jointe si autorisée.
- Historique conservé; une correction ne doit pas effacer silencieusement l'ancienne valeur.
- Les examens « attendus » dépendent du protocole validé, du terme et du contexte; l'application signale une donnée manquante sans prescrire elle-même un examen.

Les examens à considérer lors du cadrage avec les professionnels comprennent, selon le protocole applicable, hémoglobine/NFS, groupe sanguin et Rhésus, tests VIH/syphilis/hépatite B, analyses urinaires, examens liés au paludisme, glycémie et échographie. Cette liste est un inventaire de cadrage, pas une prescription automatique ni un calendrier clinique complet.

### 3.5 Prévention, rendez-vous et continuité
- Rendez-vous planifié, réalisé, reporté ou manqué; motif si connu, sans inférer une intention à partir d'une absence.
- Interventions préventives documentées selon le protocole, avec date et source.
- Rappels SMS configurables et respectueux de la confidentialité.
- Références entre structures avec état d'envoi, réception, prise en charge déclarée et clôture.
- Aucune pénalisation ou restriction de service basée sur un score de risque.

### 3.6 Accouchement, nouveau-né et post-partum
- Issue de grossesse, date/heure si disponibles, structure, type d'accouchement et événements documentés.
- Distinguer les événements de la mère et ceux de chaque nouveau-né.
- Lier la naissance aux dossiers des enfants existants ou créer les dossiers nécessaires selon les règles métier.
- Programmer et enregistrer les contacts postnataux, suivis de croissance et vaccinations.
- Contrôles de cohérence : liens mère-enfant, grossesse déjà clôturée, doublons et discordances de dates.

## 4. Architecture des fonctions IA

Les trois familles de modèles doivent rester séparées et versionnées :

- **Discontinuité du suivi vaccinal** : évaluer l'heuristique existante avant de prétendre qu'elle fournit une probabilité fiable.
- **Discontinuité du suivi prénatal** : recherche sur les rendez-vous et la continuité du suivi, avec prise en compte des barrières d'accès et des données manquantes.
- **Événements fœtaux et complications obstétricales** : cibles statistiques précises, définitions approuvées, horizon de prédiction explicite, validation rétrospective puis validation externe avant tout usage réel.

Aucun score ne doit être appelé « confiance » ou « probabilité clinique » sans calibration et évaluation adaptées. Les performances doivent être mesurées séparément pour chaque événement et sur des données représentatives. Éviter les fuites de données temporelles et les chevauchements de patient entre apprentissage et test.

Une sortie exploratoire ne peut jamais supprimer une information de sécurité ni conclure qu'une personne peut attendre avant d'être évaluée. Les règles d'orientation et les messages de signes d'alerte doivent être approuvés par les responsables sanitaires compétents et être indépendants de la prédiction.

## 5. Phases et critères d'acceptation

### Phase 0 — Cadrage sanitaire, métier et données
- Recenser les protocoles nationaux applicables et leurs versions.
- Fixer les définitions des événements, les finalités et les utilisateurs autorisés.
- Définir les bases légales, notices, mécanismes de consentement lorsque requis et formalités avec l'APDP.
- **Acceptation :** matrice des rôles, dictionnaire de données et limites d'utilisation approuvés avant le pilote.

### Phase 1 — Dossier longitudinal et qualité des données
- Auditer migrations, modèles, validateurs et tests existants avant d'ajouter des colonnes.
- Structurer les antécédents, la datation et la provenance.
- Normaliser les mesures et unités après validation du référentiel.
- Mettre des contraintes de cohérence et protéger l'historique des corrections.
- **Acceptation :** migrations réversibles, tests de validation, gestion des valeurs inconnues et absence de régression du suivi vaccinal.

### Phase 2 — Workflow prénatal
- Chronologie de grossesse et calendrier paramétrable de contacts.
- Formulaires progressifs pour symptômes, paramètres et examens.
- Rendez-vous, rappels, références et gestion de l'information manquante.
- **Acceptation :** test fonctionnel de bout en bout d'une grossesse normale et de scénarios de données incomplètes, sans diagnostic automatique.

### Phase 3 — Accouchement et post-partum
- Compléter l'issue de grossesse et les informations structurées de naissance.
- Sécuriser le lien entre mère, grossesse, épisode d'accouchement et enfant.
- Organiser le suivi postnatal et le raccord au calendrier vaccinal.
- **Acceptation :** pas de doublons silencieux; les discordances sont signalées et les permissions vérifiées.

### Phase 4 — IA de recherche/évaluation
- Auditer les données disponibles, leurs lacunes et leur qualité.
- Établir des protocoles d'évaluation distincts pour chaque cible.
- Documenter calibration, sensibilité, spécificité, valeurs prédictives, taux de données absentes et sous-groupes pertinents.
- **Acceptation :** pas de prédiction clinique affichée comme fiable sans validation approuvée; la sortie s'abstient lorsque les données sont insuffisantes.

### Phase 5 — Sécurité et conformité
- Authentification et autorisation de chaque endpoint et journal sensible.
- Gestion des secrets par environnement, restriction des ports, chiffrement et sauvegardes testées.
- Politique de conservation, journalisation minimisée et procédure d'incident.
- **Acceptation :** tests d'accès inter-centres, test de restauration, audit de configuration et revue des formalités pertinentes.

### Phase 6 — Pilote et amélioration
- Tests avec scénarios réalistes et données synthétiques pour les tests logiciels.
- Formation, assistance et collecte des retours du personnel.
- Mesure de la complétude, des rendez-vous réalisés, de la continuité des références et de la qualité des données.
- **Acceptation :** critères et responsables du pilote définis; déploiement élargi uniquement après revue formelle.

## 6. Références de cadrage

- OMS — recommandations sur les soins prénatals : https://www.who.int/publications/i/item/9789241549912
- OMS — recommandations pour les soins postnatals : https://www.who.int/publications/i/item/9789240045989
- OMS — éthique et gouvernance de l'IA pour la santé : https://www.who.int/publications/i/item/9789240029200
- Mali — loi n° 2013-015 du 21 mai 2013 relative à la protection des données à caractère personnel : vérifier le texte officiel et ses éventuelles évolutions auprès des autorités compétentes avant le déploiement.

> Ce document est un plan d'évolution logiciel. Il ne constitue ni un protocole médical ni une validation clinique des modèles.
