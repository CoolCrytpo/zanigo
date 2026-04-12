-- ─────────────────────────────────────────────
-- Migration 002 — Events, Comments, Banners
-- ─────────────────────────────────────────────

-- Add new campaign types
ALTER TYPE campaign_type ADD VALUE IF NOT EXISTS 'event';
ALTER TYPE campaign_type ADD VALUE IF NOT EXISTS 'announcement';
ALTER TYPE campaign_type ADD VALUE IF NOT EXISTS 'carousel';

-- ─────────────────────────────────────────────
-- Events (uses campaigns table with type='event')
-- Extend campaigns with event-specific metadata via target JSONB
-- No new table needed — event metadata stored in target:
-- { event_date, event_end_date, listing_id, location, all_day }
-- ─────────────────────────────────────────────

-- ─────────────────────────────────────────────
-- Announcements / Banners (uses campaigns table with type='announcement'|'carousel')
-- asset_url = image, cta_url = action link, title = text content
-- target JSONB = { placement: 'homepage_top'|'explorer_top'|'global', color, bg }
-- ─────────────────────────────────────────────

-- ─────────────────────────────────────────────
-- Listing Comments
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listing_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  pseudo      TEXT,
  email       TEXT,
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 5 AND 1000),
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listing_comments_listing_idx ON listing_comments(listing_id);
CREATE INDEX IF NOT EXISTS listing_comments_status_idx  ON listing_comments(status);
