# CoWork'Space

Application web de réservation de **postes de travail** et de **salles de réunion** pour l'espace de coworking CoWork'Space (50 postes en open space, 4 salles de réunion, 80 membres).

Elle remplace le fichier Excel du client et rend les réservations en double **impossibles** : la base de données elle-même refuse deux réservations qui se chevauchent sur le même espace.

> Projet réalisé en 2 semaines par une équipe de 3 personnes (La Plateforme).

---

## Sommaire
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation et lancement](#installation-et-lancement)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Tests](#tests)
- [Structure du projet](#structure-du-projet)
- [Workflow Git](#workflow-git)
- [Documentation](#documentation)

---

## Fonctionnalités

État d'avancement : ✅ terminé · 🚧 en cours · ⏳ à venir

| Module | Fonctionnalités | État |
|---|---|---|
| **Authentification** | Inscription avec validation de l'email, validation manuelle par un admin, connexion, mot de passe oublié / réinitialisation, modification du profil (nom, prénom, téléphone, photo) | 🚧 |
| **Visualisation** | Plan interactif de l'open space et des salles, couleur selon le statut actuel, équipements, nombre de places | ⏳ |
| **Réservation** | Filtres (type, équipement, capacité), calendrier de la semaine, réservation récurrente, modification, annulation, historique, événement privé / public | ⏳ |
| **Administration** | CRUD des espaces et équipements, liste des membres (actif / inactif), validation des inscriptions, tableau de bord (réservations du jour, taux d'occupation de la semaine) | ⏳ |
| **Notifications** | Emails de confirmation, de rappel 24h avant et d'annulation | ⏳ |
| **Transverse** | Recherche globale, export PDF de ses réservations, affichage adapté au mobile | ⏳ |

### Règles de réservation
- Ouverture du **lundi au vendredi, de 8h à 20h** (fuseau Europe/Paris).
- Créneaux libres, alignés sur le **quart d'heure** (ex. 9h15 → 11h45).
- Une réservation tient dans **une seule journée**, au maximum **30 jours à l'avance**, jamais dans le passé.
- **Récurrence** hebdomadaire (ex. tous les mardis matin) sur 8 semaines maximum. Si une seule date est déjà prise, toute la série est refusée et les dates en conflit sont affichées.
- **Privé / public** : pour une réservation privée, les autres membres voient seulement « Occupé ». Pour une réservation publique, le titre est visible de tous.

---

## Stack technique

| Couche | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, React Hook Form + Zod, FullCalendar |
| Backend | Java 21, Spring Boot 4 (Web, Data JPA, Security, OAuth2 Resource Server / JWT, Validation, Mail, Thymeleaf) |
| Base de données | PostgreSQL 17, migrations Flyway |
| Emails (dev) | Mailpit : faux serveur SMTP avec une boîte de réception web |
| Tests | JUnit 5, Mockito, Testcontainers (back) · Vitest, Testing Library (front) |
| Outillage | Docker Compose, Maven Wrapper, ESLint, Prettier, GitHub Actions |

Les raisons de ces choix sont détaillées dans [`docs/choix-techniques.md`](docs/choix-techniques.md).

---

## Prérequis

| Outil | Version | Vérifier avec |
|---|---|---|
| Java (JDK) | 21 | `java -version` |
| Node.js | 20 ou plus | `node -v` |
| Docker + Docker Compose | récent | `docker compose version` |

Maven n'a pas besoin d'être installé : le projet fournit le wrapper `./mvnw`.

---

## Installation et lancement

### 1. Cloner le projet et configurer l'environnement
```bash
git clone https://github.com/yumetia/co-workspace.git
cd co-workspace
cp .env.example .env
```
Ensuite, ouvrez `.env` et remplacez **`JWT_SECRET`** par une valeur aléatoire :
```bash
openssl rand -base64 48
```
> Si un port est déjà occupé sur votre machine (par exemple `5432` par un autre PostgreSQL), changez `DB_PORT`, `FRONTEND_PORT` / `FRONTEND_URL` ou `MAIL_PORT` dans `.env`.

### 2. Lancer la base de données et Mailpit
```bash
docker compose up -d
```
- PostgreSQL écoute sur `localhost:${DB_PORT}` (5432 par défaut).
- La boîte mail Mailpit est accessible sur **http://localhost:8025** : tous les emails envoyés par l'application y arrivent.

### 3. Lancer le backend (API)
```bash
cd backend
./mvnw spring-boot:run
```
L'API répond sur **http://localhost:8080/api**. Au premier démarrage, Flyway crée les tables et, en profil `dev` (actif par défaut), des données de démonstration sont insérées.

### 4. Lancer le frontend
Dans un autre terminal :
```bash
cd frontend
npm install
npm run dev
```
L'application est accessible sur **http://localhost:5173**, ou sur le port défini par `FRONTEND_PORT`.

### Arrêter
```bash
docker compose down        # arrête les conteneurs (les données sont conservées)
docker compose down -v     # arrête et SUPPRIME les données de la base
```

---

## Comptes de démonstration

Ces comptes sont créés automatiquement en profil `dev` :

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@coworkspace.local` | `Admin123!` |
| Membre | `alice@coworkspace.local` | `Member123!` |
| Membre | `bob@coworkspace.local` | `Member123!` |

---

## Tests

```bash
# Backend : tests unitaires + tests d'intégration (Docker requis pour Testcontainers)
cd backend && ./mvnw verify

# Frontend : lint, tests unitaires, build
cd frontend && npm run lint && npm test && npm run build
```

Le scénario de test manuel (inscription → réservation) est décrit dans [`docs/scenario-test.md`](docs/scenario-test.md).

---

## Structure du projet

```
co-workspace/
├── backend/                 API REST Spring Boot
│   └── src/main/java/com/coworkspace/
│       ├── auth/            inscription, connexion JWT, emails de vérification
│       ├── user/            profil, photo, membres
│       ├── space/           espaces, équipements, statut sur le plan
│       ├── reservation/     règles métier, récurrence, historique, PDF
│       ├── notification/    emails et rappels planifiés
│       ├── dashboard/       statistiques admin
│       ├── search/          recherche globale
│       └── common/          configuration, sécurité, gestion des erreurs
├── frontend/                Application React
│   └── src/
│       ├── api/             appels à l'API
│       ├── features/        un dossier par fonctionnalité (auth, plan, reservations…)
│       ├── components/      composants d'interface réutilisables
│       ├── routes/          routage et routes protégées
│       └── lib/             utilitaires et types
├── docs/                    dossier de conception
├── docker-compose.yml       PostgreSQL + Mailpit
└── .env.example             modèle de configuration
```

---

## Workflow Git

| Branche | Rôle |
|---|---|
| `main` | Version stable, livrable. On n'y fusionne que `develop`, une fois validé. |
| `develop` | Branche d'intégration : chaque fonctionnalité terminée y est fusionnée. |
| `feature/<module>` | Une branche par module, créée depuis `develop`. |
| `docs/<sujet>` | Documentation de conception. |

Branches de travail : `feature/socle-technique`, `feature/auth`, `feature/visualisation`, `feature/reservation`, `feature/notifications`, `feature/administration`, `feature/transverse`, `docs/conception`.

**Règles**
- Avant de commencer sur une branche : `git switch feature/xxx && git merge develop` pour repartir à jour.
- Messages de commit au format [Conventional Commits](https://www.conventionalcommits.org/fr/) : `feat(auth): ajoute la vérification d'email`, `fix(reservation): …`, `docs: …`, `test: …`, `chore: …`.
- Des petits commits réguliers, un commit = un changement cohérent.
- Fusion dans `develop` via une Pull Request relue par un autre membre, avec la CI au vert.

---

## Documentation

| Document | Contenu |
|---|---|
| [`docs/use-cases.md`](docs/use-cases.md) | Diagramme des cas d'utilisation |
| [`docs/wireframes.md`](docs/wireframes.md) | Maquettes des écrans principaux |
| [`docs/mcd-mld.md`](docs/mcd-mld.md) | Modèle conceptuel et logique des données |
| [`docs/choix-techniques.md`](docs/choix-techniques.md) | Stack et justifications |
| [`docs/api.md`](docs/api.md) | Endpoints de l'API REST |
| [`docs/scenario-test.md`](docs/scenario-test.md) | Parcours de test inscription → réservation |
