-- ZaniGo — Migration 001: Initial schema
-- Run: psql $DATABASE_URL -f db/migrations/001_initial.sql

BEGIN;

-- ─────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For ILIKE fast search

-- ─────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────

CREATE TYPE listing_type AS ENUM ('place', 'spot', 'walk', 'service');
CREATE TYPE dog_policy_status AS ENUM ('allowed', 'conditional', 'disallowed', 'unknown');
CREATE TYPE trust_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE verification_status AS ENUM (
  'published', 'draft', 'pending_review', 'needs_recheck', 'conflict', 'archived'
);
CREATE TYPE reaction_type AS ENUM ('useful', 'thanks', 'love', 'oops');
CREATE TYPE contribution_type AS ENUM ('new_listing', 'correction', 'report');
CREATE TYPE contribution_status AS ENUM ('pending', 'approved', 'rejected', 'merged');
CREATE TYPE campaign_type AS ENUM (
  'featured_listing', 'inline_banner', 'category_sponsor', 'seasonal'
);
CREATE TYPE user_role AS ENUM (
  'superadmin', 'moderator', 'content_manager', 'sponsor_manager', 'pro', 'user'
);
CREATE TYPE source_type AS ENUM (
  'official', 'field', 'social', 'press', 'osm', 'google', 'other'
);

-- ─────────────────────────────────────────────
-- Communes
-- ─────────────────────────────────────────────

CREATE TABLE communes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  lat        NUMERIC(10, 6),
  lng        NUMERIC(10, 6),
  geo        GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX communes_slug_idx ON communes(slug);
CREATE INDEX communes_geo_idx ON communes USING GIST(geo);

-- ─────────────────────────────────────────────
-- Listing categories
-- ─────────────────────────────────────────────

CREATE TABLE listing_categories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         TEXT NOT NULL UNIQUE,
  label        TEXT NOT NULL,
  icon         TEXT NOT NULL DEFAULT '📍',
  listing_type listing_type NOT NULL,
  sort_order   INT NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────
-- Amenities
-- ─────────────────────────────────────────────

CREATE TABLE listing_amenities (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug  TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icon  TEXT NOT NULL DEFAULT '✓',
  type  TEXT NOT NULL DEFAULT 'general'
);

-- ─────────────────────────────────────────────
-- Listings (core entity)
-- ─────────────────────────────────────────────

CREATE TABLE listings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type                listing_type NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  title               TEXT NOT NULL,
  short_description   TEXT,
  long_description    TEXT,
  commune_id          UUID REFERENCES communes(id),
  category_id         UUID REFERENCES listing_categories(id),
  address             TEXT,
  lat                 NUMERIC(10, 6),
  lng                 NUMERIC(10, 6),
  geo                 GEOMETRY(Point, 4326),
  dog_policy_status   dog_policy_status NOT NULL DEFAULT 'unknown',
  dog_policy_rules    TEXT,
  trust_level         trust_level NOT NULL DEFAULT 'low',
  verified_at         TIMESTAMPTZ,
  verification_status verification_status NOT NULL DEFAULT 'draft',
  is_published        BOOLEAN NOT NULL DEFAULT false,
  is_featured         BOOLEAN NOT NULL DEFAULT false,
  is_sponsored        BOOLEAN NOT NULL DEFAULT false,
  campaign_id         UUID,
  contact_phone       TEXT,
  contact_email       TEXT,
  website_url         TEXT,
  social_urls         JSONB,
  trail_details       JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at        TIMESTAMPTZ
);

CREATE INDEX listings_type_idx ON listings(type);
CREATE INDEX listings_slug_idx ON listings(slug);
CREATE INDEX listings_commune_idx ON listings(commune_id);
CREATE INDEX listings_category_idx ON listings(category_id);
CREATE INDEX listings_status_idx ON listings(verification_status);
CREATE INDEX listings_published_idx ON listings(is_published) WHERE is_published = true;
CREATE INDEX listings_featured_idx ON listings(is_featured) WHERE is_featured = true;
CREATE INDEX listings_geo_idx ON listings USING GIST(geo);
CREATE INDEX listings_title_trgm ON listings USING GIN(title gin_trgm_ops);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- Listing photos
-- ─────────────────────────────────────────────

CREATE TABLE listing_photos (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT,
  is_cover   BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX listing_photos_listing_idx ON listing_photos(listing_id);

-- ─────────────────────────────────────────────
-- Listing <-> Amenities (m2m)
-- ─────────────────────────────────────────────

CREATE TABLE listing_to_amenities (
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES listing_amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, amenity_id)
);

-- ─────────────────────────────────────────────
-- Listing hours
-- ─────────────────────────────────────────────

CREATE TABLE listing_hours (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  day        SMALLINT NOT NULL CHECK (day BETWEEN 0 AND 6), -- 0=Mon, 6=Sun
  open_time  TIME NOT NULL,
  close_time TIME NOT NULL,
  UNIQUE (listing_id, day)
);

-- ─────────────────────────────────────────────
-- Listing contacts
-- ─────────────────────────────────────────────

CREATE TABLE listing_contacts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('phone', 'email', 'website', 'facebook', 'instagram', 'maps')),
  value      TEXT NOT NULL,
  label      TEXT
);

-- ─────────────────────────────────────────────
-- Verifications
-- ─────────────────────────────────────────────

CREATE TABLE verifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  method      TEXT,
  notes       TEXT,
  user_id     UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX verifications_listing_idx ON verifications(listing_id);

-- ─────────────────────────────────────────────
-- Source evidences
-- ─────────────────────────────────────────────

CREATE TABLE source_evidences (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  source_type source_type NOT NULL DEFAULT 'other',
  source_url  TEXT,
  excerpt     TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX source_evidences_listing_idx ON source_evidences(listing_id);

-- ─────────────────────────────────────────────
-- Reactions
-- ─────────────────────────────────────────────

CREATE TABLE reactions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  type       reaction_type NOT NULL,
  anon_hash  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, type, anon_hash)
);

CREATE INDEX reactions_listing_idx ON reactions(listing_id);

-- ─────────────────────────────────────────────
-- Contributions
-- ─────────────────────────────────────────────

CREATE TABLE contributions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id     UUID REFERENCES listings(id),
  type           contribution_type NOT NULL,
  data           JSONB NOT NULL DEFAULT '{}',
  status         contribution_status NOT NULL DEFAULT 'pending',
  submitter_anon TEXT,
  reviewed_by    UUID,
  reviewed_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX contributions_status_idx ON contributions(status);
CREATE INDEX contributions_listing_idx ON contributions(listing_id);

-- ─────────────────────────────────────────────
-- Campaigns
-- ─────────────────────────────────────────────

CREATE TABLE campaigns (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  advertiser  TEXT,
  type        campaign_type NOT NULL DEFAULT 'inline_banner',
  target      JSONB,  -- { listing_type, commune_slug, category_slug }
  asset_url   TEXT,
  cta_url     TEXT,
  cta_label   TEXT,
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  is_active   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- Ad slots
-- ─────────────────────────────────────────────

CREATE TABLE ad_slots (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_key    TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  placement   TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT false,
  campaign_id UUID REFERENCES campaigns(id)
);

-- ─────────────────────────────────────────────
-- Campaign stats
-- ─────────────────────────────────────────────

CREATE TABLE campaign_stats (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  impressions INT NOT NULL DEFAULT 0,
  clicks      INT NOT NULL DEFAULT 0,
  UNIQUE (campaign_id, date)
);

-- ─────────────────────────────────────────────
-- Pro profiles
-- ─────────────────────────────────────────────

CREATE TABLE pro_profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID,
  business_name TEXT NOT NULL,
  type          TEXT NOT NULL,
  contact       JSONB,
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Users & Auth
-- ─────────────────────────────────────────────

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT,
  role          user_role NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_sessions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX admin_sessions_user_idx ON admin_sessions(user_id);

-- ─────────────────────────────────────────────
-- Audit log
-- ─────────────────────────────────────────────

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  before      JSONB,
  after       JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_entity_idx ON audit_logs(entity_type, entity_id);
CREATE INDEX audit_logs_user_idx ON audit_logs(user_id);

-- ─────────────────────────────────────────────
-- Seed: Communes La Réunion
-- ─────────────────────────────────────────────

INSERT INTO communes (slug, name, lat, lng) VALUES
  ('saint-denis',         'Saint-Denis',         -20.8823, 55.4504),
  ('saint-paul',          'Saint-Paul',           -21.0080, 55.2728),
  ('saint-pierre',        'Saint-Pierre',         -21.3393, 55.4781),
  ('le-tampon',           'Le Tampon',            -21.2786, 55.5155),
  ('saint-andre',         'Saint-André',          -20.9609, 55.6472),
  ('saint-louis',         'Saint-Louis',          -21.2733, 55.4069),
  ('saint-joseph',        'Saint-Joseph',         -21.3812, 55.6156),
  ('saint-leu',           'Saint-Leu',            -21.1617, 55.2852),
  ('saint-benoit',        'Saint-Benoît',         -21.0384, 55.7139),
  ('sainte-marie',        'Sainte-Marie',         -20.9009, 55.5341),
  ('sainte-suzanne',      'Sainte-Suzanne',       -20.9270, 55.5952),
  ('la-possession',       'La Possession',        -20.9333, 55.3394),
  ('le-port',             'Le Port',              -20.9353, 55.3016),
  ('trois-bassins',       'Trois-Bassins',        -21.0980, 55.2953),
  ('cilaos',              'Cilaos',               -21.1356, 55.4786),
  ('salazie',             'Salazie',              -21.0350, 55.6400),
  ('entre-deux',          'Entre-Deux',           -21.2142, 55.4745),
  ('les-avirons',         'Les Avirons',          -21.2400, 55.3167),
  ('petite-ile',          'Petite-Île',           -21.3663, 55.5640),
  ('saint-philippe',      'Saint-Philippe',       -21.3594, 55.7695),
  ('bras-panon',          'Bras-Panon',           -21.0019, 55.6881),
  ('la-plaine-des-palmistes', 'La Plaine-des-Palmistes', -21.1167, 55.6167),
  ('sainte-rose',         'Sainte-Rose',          -21.1233, 55.7939),
  ('letang-sale',         'L''Étang-Salé',        -21.2667, 55.3667)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- Seed: Categories
-- ─────────────────────────────────────────────

INSERT INTO listing_categories (slug, label, icon, listing_type, sort_order) VALUES
  -- Places
  ('plage',          'Plage',               '🏖️',  'place',   10),
  ('parc',           'Parc / Jardin',       '🌿',  'place',   20),
  ('restaurant',     'Restaurant',          '🍽️',  'place',   30),
  ('cafe',           'Café / Bar',          '☕',  'place',   40),
  ('hebergement',    'Hébergement',         '🏨',  'place',   50),
  ('commerce',       'Commerce',            '🛍️',  'place',   60),
  ('loisirs',        'Loisirs / Activité',  '🎯',  'place',   70),
  -- Spots
  ('spot-nature',    'Nature',              '🌲',  'spot',    110),
  ('spot-vue',       'Point de vue',        '🔭',  'spot',    120),
  ('spot-plage',     'Spot plage',          '🌊',  'spot',    130),
  ('spot-foret',     'Forêt',              '🌳',  'spot',    140),
  -- Walks
  ('randonnee',      'Randonnée',           '🥾',  'walk',    210),
  ('balade',         'Balade',              '🚶', 'walk',    220),
  ('sentier',        'Sentier nature',      '🌿',  'walk',    230),
  -- Services
  ('veterinaire',    'Vétérinaire',         '🩺',  'service', 310),
  ('toilettage',     'Toilettage',          '✂️',  'service', 320),
  ('pension',        'Pension / Garderie',  '🛏️',  'service', 330),
  ('educateur',      'Éducateur canin',     '🐕‍🦺', 'service', 340),
  ('pet-sitting',    'Pet-sitting',         '🏠',  'service', 350),
  ('transport',      'Transport animalier', '🚗',  'service', 360)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- Seed: Amenities
-- ─────────────────────────────────────────────

INSERT INTO listing_amenities (slug, label, icon, type) VALUES
  ('eau',          'Point d''eau',          '💧', 'nature'),
  ('ombre',        'Ombre',                 '🌳', 'comfort'),
  ('parking',      'Parking',               '🅿️', 'access'),
  ('cloture',      'Zone clôturée',         '🔒', 'safety'),
  ('laisse-off',   'Sans laisse autorisé',  '🐾', 'dog'),
  ('pique-nique',  'Zone pique-nique',      '🧺', 'comfort'),
  ('wc',           'Toilettes',             '🚻', 'comfort'),
  ('rampe',        'Accès PMR',             '♿', 'access'),
  ('vue-mer',      'Vue mer',               '🌊', 'view'),
  ('vue-piton',    'Vue piton / volcan',    '🌋', 'view')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- Seed: Ad slots
-- ─────────────────────────────────────────────

INSERT INTO ad_slots (slot_key, label, placement, is_active) VALUES
  ('home_hero_partner',       'Hero home — partenaire',        'home',    false),
  ('home_inline_1',           'Home inline 1',                 'home',    false),
  ('home_inline_2',           'Home inline 2',                 'home',    false),
  ('listing_inline_3',        'Liste résultats — rang 3',      'listing', false),
  ('listing_inline_8',        'Liste résultats — rang 8',      'listing', false),
  ('map_bottom_partner',      'Carte — bottom sheet',          'map',     false),
  ('detail_footer_partner',   'Fiche — bas de page',           'detail',  false),
  ('detail_sidebar_partner',  'Fiche — sidebar',               'detail',  false),
  ('pro_page_top_banner',     'Page pro — bannière haut',      'pro',     false)
ON CONFLICT (slot_key) DO NOTHING;

COMMIT;
