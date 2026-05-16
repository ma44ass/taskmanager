# TaskManager API 

Application de gestion de tâches avec une architecture **REST** et sécurisée par une couche de validation de données **Zod**.


##  Installation et Lancement

Suivez ces étapes pour configurer le projet localement sur Ubuntu :

### 1. Prérequis
* **Node.js** (v14+)
* **MySQL** (installé et configuré)
* **Live Server** (extension VS Code pour le frontend)

### 2. Installation
Clonez le dépôt et installez les dépendances :
```bash
git clone <url-du-repo>
cd task-manager
npm install
```

##  Fonctionnalités & Implémentation

Le projet permet de gérer le cycle de vie complet des tâches (CRUD) avec une attention particulière à la sécurité et à l'intégrité des données :

* **Ajouter une tâche** : Création via `POST`.
    * *Technique* : On utilise `taskSchema` pour valider le titre (3-50 caractères) et la description. Le système gère automatiquement les valeurs par défaut pour le statut et la date.
* **Consulter toutes les tâches** : Récupération via `GET`.
    * *Technique* : On applique un filtrage par `user_id` pour garantir que chaque utilisateur accède uniquement à ses propres données.
* **Consulter une tâche précise** : Récupération via `GET /:id`.
    * *Technique* : On valide le format de l'ID via `idSchema` (Regex) avant d'interroger la base MySQL pour prévenir les requêtes malformées.
* **Modifier une tâche** : Mise à jour dynamique via `PUT`.
    * *Technique* : On a implémenté le `updateTaskSchema` qui permet des mises à jour partielles (ne modifier que le titre ou uniquement le statut) sans affecter les autres champs de la base.
* **Supprimer une tâche** : Effacement définitif via `DELETE`.
    * *Technique* : On vérifie systématiquement l'existence de la tâche et on gère les erreurs 404 pour informer l'utilisateur si l'élément n'existe plus.

## Sécurité & Validation (Zod)

Pour garantir la robustesse du backend, on a mis en place une couche de validation stricte :
* **Protection contre l'Injection** : On utilise `.strict()` dans les schémas pour rejeter tout champ non autorisé dans le corps des requêtes.
* **Validation des Paramètres** : Les IDs de routes sont vérifiés par une expression régulière (`/^\d+$/`) afin de bloquer les entrées malveillantes dès l'entrée de l'API.
* **Gestion des Erreurs** : En cas de données invalides, on renvoie un statut **400 Bad Request** avec un objet JSON détaillé pour faciliter le travail du développement Frontend.

##  Évolutions futures (Backlog)

Le projet dispose déjà d'une structure de backend avancée. Les fonctionnalités suivantes sont prévues pour les prochaines versions :

- [ ] **Sécurisation via JWT (JSON Web Token)** : 
  - Réactivation des routes d'authentification (`authRoutes.js`).
  - Middleware de protection des routes de tâches.
  - Gestion du hachage des mots de passe avec `bcrypt`.
- [ ] **Système Multi-utilisateurs** : Lier dynamiquement les tâches à l'ID de l'utilisateur connecté (actuellement fixé à `user_id: 1` pour le développement).
- [ ] **Pagination** : Gérer l'affichage pour un grand nombre de tâches.

## 💻 Environnement Technique

* **Runtime** : Node.js & Express
* **Database** : MySQL
* **Validation** : Zod
* **Frontend** : HTML5, JavaScript (Fetch API), Tailwind CSS
