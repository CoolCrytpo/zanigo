# ZaniGo

**Le guide péi pour bat'karé avec son animal**

Hub local animal friendly à La Réunion — lieux, spots, balades, services, partenaires.

---

## Stack

- **Next.js 15** App Router + TypeScript
- **Tailwind CSS v4** (CSS-first, design tokens dans `styles/globals.css`)
- **PostgreSQL + PostGIS**
- **Meilisearch** (recherche + facettes + géo)
- **MapLibre GL JS** (carte)

---

## Installation

```bash
# 1. Cloner le repo
git clone https://github.com/yourorg/zanigo.git
cd zanigo

# 2. Variables d'environnement
cp .env.example .env.local
# Remplir DATABASE_URL, MEILISEARCH_HOST, etc.

# 3. Installer les dépendances
npm install

# 4. Créer la base de données
psql $DATABASE_URL -f db/migrations/001_initial.sql

# 5. Lancer en développement
npm run dev
```

---

## Architecture

```
app/
  (public)/       → Pages publiques (home, lieux, spots, balades, services, explorer...)
  admin/          → Back-office protégé (dashboard, listings, modération, sponsors)
  api/            → API routes (listings, reactions, contributions, admin)
components/
  ui/             → Design system (badges, boutons...)
  shell/          → TopNav, Footer
  listings/       → Cards (ListingCard)
  sponsor/        → AdSlot
  admin/          → Composants admin
features/
  reactions/      → ReactionBar (client, optimistic)
lib/
  db/             → Pool pg + queries
  auth/           → Session JWT cookie
  utils/          → Formatters
config/           → Constants, nav links
db/migrations/    → SQL
styles/           → globals.css (tokens Tailwind)
```

---

## URL structure

| URL | Description |
|-----|-------------|
| `/` | Home hub |
| `/explorer` | Recherche globale |
| `/lieux` | Liste des lieux |
| `/lieux/[slug]` | Fiche lieu |
| `/spots` | Liste des spots |
| `/spots/[slug]` | Fiche spot |
| `/balades` | Liste des balades |
| `/balades/[slug]` | Fiche balade |
| `/services` | Liste des services |
| `/services/[slug]` | Fiche service |
| `/a-la-une` | Fiches mises en avant |
| `/explorer` | Recherche unifiée |
| `/pro` | Espace pro |
| `/pro/sponsor` | Page partenariat |
| `/contribuer` | Formulaire contribution |
| `/admin` | Back-office |

---

## Types de listings

| Type | URL base | Description |
|------|----------|-------------|
| `place` | `/lieux` | Restaurants, plages, hébergements... |
| `spot` | `/spots` | Parcs, points de vue, spots nature |
| `walk` | `/balades` | Randonnées, sentiers |
| `service` | `/services` | Vétérinaires, toilettage, pension... |

---

## Politique chiens

- `allowed` — Chiens acceptés
- `conditional` — Sous conditions (laisse, terrasse seulement...)
- `disallowed` — Non autorisés
- `unknown` — À confirmer

---

## Design system

Palette définie dans `styles/globals.css` via `@theme` Tailwind v4 :

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-basalte` | `#1F2320` | Structure, titres forts |
| `--color-sable` | `#F5F1E8` | Fond principal |
| `--color-vert` | `#2F6B57` | Identité, confiance, CTA |
| `--color-lagon` | `#2C6E8F` | Carte, eau, découverte |
| `--color-corail` | `#E16A4A` | CTA principal, alertes |
| `--color-jaune` | `#E5B94B` | Favoris, mise en avant |

Fonts : **Plus Jakarta Sans** (headings) + **Inter** (UI)

---

## Système sponsor

Slots publicitaires définis en DB (`ad_slots`). Composant `<AdSlot slotKey="..." />` :
- Server component async
- Retourne `null` si slot inactif ou sans campagne
- Toujours labelisé "Sponsorisé"

Slots disponibles :
- `home_hero_partner`, `home_inline_1`, `home_inline_2`
- `listing_inline_3`, `listing_inline_8`
- `detail_footer_partner`, `detail_sidebar_partner`
- `map_bottom_partner`, `pro_page_top_banner`

---

## Déploiement

```bash
# Build
npm run build

# Vérification TypeScript
npm run typecheck
```

Déploiement recommandé : **Vercel** (front) + **Supabase/Neon** (DB) + **Meilisearch Cloud** (search)

Variables d'environnement requises en production : voir `.env.example`.

---

## Admin

Accès : `/admin/login`

Rôles : `superadmin`, `moderator`, `content_manager`, `sponsor_manager`

Créer un utilisateur admin en SQL :
```sql
INSERT INTO users (email, password_hash, name, role)
VALUES ('admin@zanigo.re', '<sha256-hash>', 'Admin', 'superadmin');
```

> En production, remplacer le hash SHA-256 par bcrypt dans `app/api/admin/login/route.ts`.
