# Cadre d'usage des fonctions IA — SNSC-MALI

**Statut :** exigences de conception à valider avec les responsables sanitaires, juridiques et de protection des données avant tout pilote réel.

## 1. Finalités distinctes

SNSC-MALI peut disposer de fonctions de suivi opérationnel et de modules de recherche prédictive, mais ceux-ci ne doivent pas être confondus.

1. **Suivi opérationnel** : historique, calendrier, rendez-vous, examens documentés, références et continuité mère-enfant.
2. **Informations de sécurité** : contenus pré-écrits, approuvés par les responsables sanitaires, affichés en fonction de déclarations explicites. Ils ne dépendent pas du score d'un modèle.
3. **Recherche prédictive** : expérimentation sur des événements clairement définis; aucune prétention de diagnostic ou de décision médicale tant que la destination, la validation et le statut réglementaire ne sont pas établis.

Le nom « orientation » ou un avertissement d'écran ne détermine pas, à lui seul, le statut réglementaire d'un logiciel. Il faut examiner la fonction réelle, les utilisateurs, les conséquences possibles et les textes applicables.

## 2. Exclusions de sécurité

Un score IA ne doit pas, à lui seul :
- poser un diagnostic ou affirmer qu'une complication est présente ou absente;
- recommander un traitement, une dose, un examen ou une intervention obstétricale;
- autoriser à attendre malgré un signe d'alerte reconnu;
- remplacer, retarder ou annuler une évaluation par un professionnel;
- refuser un service ou pénaliser une mère, un enfant ou une famille;
- déclencher automatiquement une décision clinique irréversible.

Un score faible ne signifie jamais qu'une grossesse est sans danger. Un score indisponible n'est pas un résultat rassurant.

## 3. Séparation des cibles

Les cibles suivantes doivent avoir des définitions, jeux de données et évaluations indépendants :

- **Discontinuité vaccinale** : définir le retard ou l'absence de vaccination sur une période précise, en distinguant l'événement observé de ses causes supposées.
- **Discontinuité prénatale** : définir par avance ce qui constitue une rupture du suivi, en tenant compte des rendez-vous planifiés, des transferts et de la durée d'observation.
- **Événement fœtal/néonatal** : définir un événement mesurable (ex. prématurité, faible poids à la naissance ou autre issue documentée) et sa définition clinique de référence.
- **Complication de l'accouchement** : spécifier les codes/critères, la période de survenue, la source de référence et les règles de résolution des cas ambigus.

Un score générique « risque fœtal » qui combine plusieurs issues hétérogènes est déconseillé.

## 4. Contrat de réponse minimal pour une expérimentation

Chaque résultat éventuel doit indiquer :
- l'identifiant de requête, la date et la version du modèle;
- la cible exacte et l'horizon étudié;
- le statut : indisponible, recherche expérimentale ou évalué selon un protocole documenté;
- les données manquantes importantes;
- les limites connues et l'avertissement d'usage;
- l'absence de résultat quand l'entrée ne respecte pas le contrat ou qu'elle est insuffisante.

Ne pas afficher « confiance 95 % » simplement parce qu'une règle de code a attribué 0,95. Les probabilités doivent être correctement définies, calibrées et validées pour la cible et la population visées.

## 5. Sécurité des signes d'alerte

Les informations sur les signes d'alerte, approuvées par les autorités compétentes, doivent fonctionner indépendamment des modèles. Elles doivent être conçues et testées pour ne jamais être masquées par un résultat faible, absent ou indisponible.

Ce mécanisme d'information n'est pas un diagnostic automatique. Les libellés, seuils, déclencheurs et chemins d'orientation doivent être approuvés par des professionnels compétents avant usage réel.

## 6. Données et gouvernance

- Collecter uniquement les données nécessaires à une finalité définie.
- Séparer données opérationnelles, données de recherche et éventuels exports d'entraînement.
- Définir les contrôles d'accès par rôle et par structure, les durées de conservation et les procédures d'accès/correction.
- Éviter d'envoyer les identifiants directs au service IA; l'identifiant pseudonymisé reste une donnée à protéger.
- Tracer la version du modèle et les événements d'accès sans stocker inutilement des données cliniques ou identifiantes dans les logs.
- Définir les règles de retrait et de traitement des données conformément au cadre applicable.
- Obtenir un avis des responsables compétents sur les formalités APDP, le consentement lorsqu'il est requis et la recherche impliquant des données de santé.

## 7. Texte d'interface proposé

> **Information exploratoire — ne constitue pas un diagnostic.** Cette fonctionnalité présente une estimation issue d'un modèle informatique dont les limites dépendent des données disponibles et de son évaluation. Elle ne remplace pas une consultation ni l'évaluation d'un professionnel de santé. Ne retardez pas une prise en charge en vous fondant sur cette estimation.

Cette formulation est un point de départ UX, pas une garantie juridique. Elle doit être revue par le responsable sanitaire et le conseil juridique avant la mise en production.

## 8. Conditions minimales avant un essai réel

- Protocole sanitaire et finalités approuvés.
- Base légale, information des personnes et formalités requises vérifiées.
- Définitions des cibles et sources des étiquettes documentées.
- Jeu de données de validation adéquat et contrôles de fuite temporelle.
- Evaluation de calibration et d'erreurs par sous-groupes pertinents.
- Analyse des conséquences d'un faux négatif et d'un faux positif.
- Surveillance, procédure de retrait du modèle et responsable identifié.
- Aucun usage opérationnel avant validation formelle appropriée.
