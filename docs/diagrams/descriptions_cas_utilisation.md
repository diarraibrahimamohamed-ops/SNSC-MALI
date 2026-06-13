Tableau 1 : Description textuelle du cas d’utilisation « Enregistrement d’un Enfant »

Cas d’utilisation
Enregistrement d’un Enfant
But
Créer un dossier sanitaire unique pour l'enfant et générer immédiatement son calendrier vaccinal.
Acteur Principal
Agent de santé(Cscom)
Préconditions
L'agent est authentifié, le centre de santé est habilité, les informations minimales sont disponibles.
Scénario nominal
1. L'agent saisit l'identité de l'enfant, sa date de naissance, les informations du tuteur et le centre de rattachement et envoie.
2. Le système vérifie l'unicité sanitaire et l'existence du centre.
3. Le dossier enfant est créé et lié au tuteur principal.
4. Le moteur de plan vaccinal génère les doses attendues et les échéances.
5. Le système retourne la prochaine échéance et journalise l'opération.
Scénario alternatif
1a. Le numéro de téléphone du parent est invalide :
      - avertissement, enregistrement possible sans SMS
2a. Le centre n’existe pas ou n’est pas unique :
      - le système affiche un message d’erreur explicite, interrompt la    création du dossier et invite l’agent à sélectionner un centre habilité dans la liste de référence ou à contacter l’administrateur pour la régularisation du référentiel des centres de santé.
Postcondition
Le dossier enfant existe, le calendrier vaccinal est initialisé, l'audit est tracé.

Tableau 2 : Description textuelle du cas d’utilisation « Consulter le statut vaccinal »

Champ
Détail
Acteur Principal
Agent de santé(Cscom)
But
Visualiser les doses administrées, les doses attendues, les retards et la prochaine échéance.
Précondition
L'enfant existe dans le système et l'agent dispose des droits de consultation.
Scénario nominal
1. L'agent envoie la recherche d'enfant par identifiant sanitaire.
2. Le système recherche l’enfant.
3. Le système charge le dossier, le calendrier, les actes vaccinaux et les rendez-vous.
4. Le système calcule le statut courant : à jour, en retard ou incomplet.
5. L'interface affiche l'historique et la prochaine échéance.
Scénario alternatif
2a. Le système ne trouve pas l’enfant :
    • Un message est affiché et invite à réessayer
3a. Le système rencontre une erreur lors du chargement :
      -    Un message est affiché et invite l’agent a réessayer ultérieurement

Postcondition
Le statut vaccinal est consultable sans altérer les données


Tableau 3 : Description textuelle du cas d’utilisation « Enregistrer une vaccination »
Champ
Détail
Acteur Principal
Agent de santé(Cscom)
But
Enregistrer une dose réellement administrée et mettre à jour le parcours vaccinal.
Préconditions
L'enfant existe, l'agent est autorisé, la dose est compatible avec les règles du calendrier ou une règle de rattrapage valide.
Scénario nominal
1. L'agent sélectionne l'enfant puis la dose administrée.
2. Le système vérifie que la dose est autorisée à la date choisie.
3. L'acte vaccinal est créé avec l'agent, le centre, la date et le lot si nécessaire.
4. Le calendrier vaccinal est mis à jour.
5. Le prochain rendez-vous est recalculé.
6. L'opération est journalisée.

Scénario alternatif
2a. Le système détecte que la dose viole le calendrier(ex : intervalle trop court) :
      - Le système bloque l’enregistrement et affiche un message d’erreur expliquant le problème
2b. L’agent sélectionne un lot périmé ou invalide :
      - Le système affiche une alerte bloquante
3a. L’agent annule la saisie avant le validation final :
     -Le système annule la création de l’acte et retourne a la liste des parents
Postcondition
L'acte vaccinal est tracé, la dose passe à l'état administré, la prochaine échéance est disponible.


Tableau 4 : Description textuelle du cas d’utilisation « Déclencher une relance SMS »
Champ
Détail
Acteur Principal
Système
But
Préparer et envoyer un rappel à l'approche d'un rendez-vous ou après détection d'un retard.
Précondition
Un rendez-vous est imminent ou en retard, un numéro de contact valide existe, la politique de relance autorise un nouvel envoi.
Scénario nominal
1. Le job de relance charge les rendez-vous à rappeler.
2. Le système consulte le niveau de risque de l'enfant ou de sa famille.
3. Il adapte la fréquence et le contenu du message.
4. Il envoie le SMS via la passerelle.
5. Il enregistre le résultat de livraison et l'audit.
Scénario alternatif
4a. La passerelle SMS échoue a cause d’un  format de numéro incorrect :
     - Le système enregistre l’échec dans le journal audit et bascule l’état du message à « non envoyer »
4b. Le serveur SMS ne répond pas :
     - Le système essaye un nombre défini de fois. Si l’échec persiste il alerte l’administrateur technique
Postcondition
La notification est tracée avec son statut, le compteur de rappels est mis à jour.


Tableau 5 : Description textuelle du cas d’utilisation « Évaluer le risque d'abandon »
Champ
Détail
Acteur Principal
Système
But
Produire un score d'aide à la priorisation des relances sans remplacer la décision métier.
Préconditions
Les événements de parcours sont disponibles ; le modèle IA est déployé.
Scénario nominal
1. Le système collecte l'historique vaccinal, les absences, les retards et les facteurs contextuels.
2. Le modèle calcule un score, un niveau de risque et des facteurs explicatifs.
3. Le score est stocké avec la version du modèle et l'indice de confiance.
4. La relance peut utiliser cette recommandation pour ajuster son intensité.
Scenario alternatif
1a. Le système détecte qu’il manque des informations essentielles (ex : aucune date de naissance ou aucun vaccin vaccin antérieur) :
     - Le modèle ne calcule pas de score. Le système enregistre un état « évaluation impossible : données incomplète »
2a. Le services d’IA est en panne ou inaccessible :
     - Le système consigne l’erreur dans le journal audit  et utilise une règle de secours (ex : calcule basé uniquement sur le retard de jours) pour ne pas bloquer les relances
Postcondition
Un indicateur de risque est disponible ; aucune décision médicale n'est automatisée.

