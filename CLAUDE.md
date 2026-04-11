# ZaniGo

## Mission
Guide local animal friendly à La Réunion — lieux, spots, balades, services, partenaires.

## Signature
"Le guide péi pour bat'karé avec son animal"

## Non-négociables
- Aucune donnée publiée automatiquement
- Toute fiche publique : statut chien + conditions + source + date vérif + confiance
- Si pas de mention explicite → statut `unknown`
- Sponsor = visible mais jamais intrusif, toujours labellisé

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS v4 (CSS-first, design tokens dans globals.css)
- PostgreSQL + PostGIS
- Meilisearch (search + facettes + geo)
- MapLibre GL JS
- Framer Motion (léger)

## Design system
Tokens dans `styles/globals.css`. Palette :
- Basalte #1F2320, Sable #F5F1E8
- Vert latanier #2F6B57 (identité/confiance)
- Bleu lagon #2C6E8F (carte/découverte)
- Corail #E16A4A (CTA/alerte)
- Jaune #E5B94B (favori/premium)

Fonts : Plus Jakarta Sans (headings) + Inter (UI)

## Architecture
```
app/
  (public)/   → pages publiques
  admin/      → back-office protégé
  api/        → routes API
components/
  ui/         → design system
  shell/      → TopNav, Footer
  listings/   → cards de listing
  map/        → composants carte
  sponsor/    → AdSlot, SponsorBanner
lib/
  db/         → client pg + queries
  auth/       → session
  search/     → Meilisearch
  utils/
config/       → constants
db/migrations/ → SQL
styles/       → globals.css (tokens)
```

## Types de listings
- `place` → lieux (plages, restos, hébergements...)
- `spot` → spots publics (parcs, points de vue...)
- `walk` → balades/randonnées
- `service` → services animaliers

## URL structure
/lieux/[slug], /spots/[slug], /balades/[slug], /services/[slug]
/explorer (search + carte), /a-la-une, /pro, /pro/sponsor, /contribuer

## Règles
- mobile-first absolu
- verbosité minimale dans les réponses
- pas de suggestions non sollicitées
