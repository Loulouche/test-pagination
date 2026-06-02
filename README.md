# Cahier des charges — Test technique

## 1. Contexte

L’entreprise est une **plateforme e‑commerce** (mode, accessoires, etc.) avec un **gros catalogue**. Aujourd’hui, le site charge **tout le catalogue d’un coup** : temps de chargement élevé, charge inutile côté navigateur et risque de mauvaise expérience utilisateur.

**Objectif du test :** concevoir une solution **paginée côté serveur**, avec **filtres** et **tris**, une gestion des erreurs, et une stack imposée.

---

## 2. Problème à résoudre


| Axes                        | Description                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Performance**             | Ne plus renvoyer ni afficher l’intégralité des articles en une seule requête / un seul rendu.                     |
| **Fonctionnalité**          | Permettre la navigation dans le catalogue (pagination **ou** scroll infini **ou** équivalent — libre choix d’UX). |
| **Recherche / exploration** | **Filtrer** (ex. par catégorie) et **trier** (ex. prix croissant / décroissant).                                  |
| **Fiabilité**               | Pas de crash en cas de paramètres invalides, réseau instable ou réponse vide.                                     |


---

## 3. Périmètre fonctionnel


| Exigence       | Détail                                                                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pagination** | Stratégie au choix (pages numérotées, « charger plus », scroll infini…) **à condition** que les données soient chargées **par blocs** depuis le backend. |
| **Filtres**    | Au minimum un filtre pertinent sur le catalogue (ex. catégorie) ; possibilité d’en ajouter d’autres si le temps le permet.                               |
| **Tris**       | Au minimum un tri sur un champ numérique ou textuel (ex. **prix** asc / desc).                                                                           |


---

## 4. Contraintes techniques (obligatoires)


| Couche              | Technologie                             |
| ------------------- | --------------------------------------- |
| **Frontend**        | **React** (JavaScript ou TypeScript)    |
| **Backend**         | **Node.js** avec **Express** (JS ou TS) |
| **Base de données** | **MongoDB** — **sans Mongoose**         |


Le reste (outillage, structure des dossiers, librairies UI) est laissé au candidat, dans la mesure où les exigences ci-dessus sont respectées.

---

## 5. Livrables attendus

- API REST (ou équivalent **documenté**) exposant une **liste d’articles paginée**, avec paramètres documentés : `page`, `limit`, filtres, etc..
- Frontend connecté à cette API, avec l’UX de pagination / chargement choisie.
- Gestion des cas limites : valeurs de pagination invalides, liste vide, erreur serveur, etc...

---

## 6. Hors périmètre / libertés

- **Design graphique :** libre (sobriété suffisante pour un test).
- **Modalité d’interaction** (boutons vs scroll infini, etc.) : libre, tant que le chargement reste **incrémental côté serveur**.


# Modifications apportées 
## Backend

### Connexion à la base de données

J'ai connecté MongoDB à Express via le driver natif Node.js (`mongodb`), sans Mongoose.
La connexion est établie au démarrage du serveur et la base de données est partagée via `app.locals.db` pour être accessible dans toutes les routes.

#### Route `/api/products`

J'ai créé une route GET qui accepte les paramètres suivants : `page`, `limit`, `category`, `sort`, `order` et `search`.

Les paramètres sont validés côté serveur pour éviter les valeurs invalides (page négative, limit trop élevée, champ de tri inexistant).

Les données sont récupérées via deux requêtes MongoDB lancées en parallèle avec `Promise.all` : une pour les produits de la page courante, une pour le total (nécessaire pour calculer le nombre de pages).

Les erreurs serveur sont gérées avec un `try/catch` qui renvoie un code 500.

### Route `DELETE /api/products/:id`

J'ai ajouté une route DELETE qui supprime un produit par son identifiant MongoDB.
Si le produit n'existe pas, la route renvoie un code 404. Les erreurs serveur sont gérées avec un `try/catch` qui renvoie un code 500.

### Structure du code

Les fonctions auxiliaires ont été extraites de la route principale pour améliorer la lisibilité :
- `parseQueryParams` : parse et valide tous les paramètres de la requête
- `buildFilter` : construit le filtre MongoDB selon la catégorie et la recherche
- `fetchProducts` : exécute les requêtes MongoDB

## Frontend

### Tableau des produits

J'ai structuré l'affichage des produits sous forme de tableau avec les colonnes : nom, catégorie, quantité et prix.

### Structure des composants

Le frontend a été découpé en composants réutilisables :
- `Filters` : barre de recherche et selects de filtres/tris
- `ProductTable` : tableau des produits
- `Pagination` : navigation entre les pages

### Appel à l'API

J'ai complété le `useEffect` pour appeler l'API à chaque changement de filtre, tri, recherche ou page.
Les paramètres sont construits dynamiquement et envoyés dans l'URL. Les états `loading` et `error` permettent d'afficher un message pendant le chargement ou en cas d'erreur.

### Barre de recherche

J'ai ajouté une barre de recherche qui filtre les produits par nom en temps réel.
À chaque modification, la page revient à 1 pour éviter de se retrouver sur une page inexistante.
Côté backend, la recherche utilise une regex MongoDB insensible à la casse.
L'objectif est de pouvoir, dans une catégorie précise (ex : chaussures), rechercher directement une marque ou un modèle spécifique sans avoir à parcourir manuellement les pages de pagination.

### Pagination

J'ai implémenté une pagination avec des boutons `<` et `>` pour naviguer page par page.
Le bouton `<` est désactivé sur la première page et `>` sur la dernière.
Les numéros affichés sont : toujours la première page, toujours la dernière, la page courante ainsi que ses voisines immédiates. Des `...` sont affichés entre les groupes de pages quand il y a un écart.

### Suppression d'un produit

J'ai ajouté un bouton de suppression sur chaque ligne du tableau. Un clic appelle la route `DELETE /api/products/:id` et retire immédiatement le produit de l'affichage sans recharger la page. Le compteur de produits se met à jour en conséquence.


### Bouton retour en haut

J'ai ajouté un bouton fixe en bas à droite de la page qui apparaît uniquement quand l'utilisateur a scrollé de plus de 300px.
En cliquant dessus, la page remonte en douceur grâce à un scroll animé.

### Indicateur de stock

J'ai ajouté une pastille colorée dans la colonne quantité pour visualiser rapidement l'état du stock :
- Rouge : stock critique (moins de 10)
- Orange : stock faible (moins de 30)
- Vert : en stock

Une légende est affichée au-dessus du tableau en haut à droite, à côté du nombre de produits trouvés, pour avoir un rappel visuel permanent.

### Nombre de produits trouvés

J'ai ajouté l'affichage du nombre total de produits correspondant aux filtres actifs, affiché en haut à gauche du tableau.
Ce nombre se met à jour automatiquement à chaque changement de catégorie ou de recherche.

### Sélecteur d'articles par page

J'ai ajouté des boutons permettant à l'utilisateur de choisir combien d'articles afficher par page : 10, 25, 50 ou 100.
La limite maximale est fixée à 100 côté backend pour respecter la consigne qui interdit de charger tout le catalogue en une seule requête, tout en s'adaptant aux utilisateurs qui préfèrent moins naviguer entre les pages.
J'ai également modifié la valeur par défaut de 10 à 50 : 10 articles par page génère un trop grand nombre de pages, tandis que 50 offre un bon compromis entre défilement et pagination. Le bouton retour en haut de page compense le scroll supplémentaire.

### Filtre par catégorie

Le select de filtre par catégorie était déjà présent dans le code fourni mais non fonctionnel car le `useEffect` était vide.
J'ai branché le filtre à l'API pour qu'il envoie la catégorie sélectionnée au backend et affiche uniquement les produits correspondants.
À chaque changement de catégorie, la page revient à 1 pour éviter de se retrouver sur une page inexistante.

### CSS et expérience utilisateur

J'ai choisi un fond blanc cassé légèrement chaud (`#f0ede8`) pour une meilleure expérience visuelle, qui contraste bien avec les éléments blancs comme les boutons.

Au survol d'une ligne du tableau, celle-ci se grise légèrement pour guider l'œil de l'utilisateur et faciliter la lecture.

J'ai ajouté des animations de survol sur les boutons de pagination, la barre de recherche et les selects : une bordure qui s'assombrit et une légère ombre apparaissent au survol pour indiquer que l'élément est cliquable.

Les boutons non cliquables (page courante, première ou dernière page déjà atteinte) sont grisés visuellement pour indiquer à l'utilisateur qu'ils ne sont pas disponibles.

### Améliorations envisagées

Lors de la réception de ce projet, aucune date limite n'a été indiquée. Par souci de réactivité et étant donné que je mène ce projet en parallèle de mes cours et de leurs échéances, j'ai priorisé une livraison rapide tout en essayant d'implémenter un maximum de fonctionnalités pertinentes. J'ai donc fait des choix en me concentrant sur une bonne gestion et lecture des données.

Pour aller plus loin, il aurait été intéressant d'ajouter des fonctionnalités d'interaction avec la base de données :

- Export du catalogue filtré en CSV
- Modification d'un article (nom, prix, stock) directement depuis le tableau
- Ajout d'un nouvel article via un formulaire
