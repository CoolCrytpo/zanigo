// ─────────────────────────────────────────────
// ZaniGo — Duplicate detection
// ─────────────────────────────────────────────
import pool from '@/lib/db/client'
import { buildDedupeKey } from './normalizer'

export interface DupeResult {
  isDuplicate: boolean
  listingId: string | null
  score: number
  matchedOn: string[]
}

export async function detectDuplicate(
  name: string,
  communeName: string,
  phone?: string,
  website?: string,
  lat?: number,
  lng?: number,
): Promise<DupeResult> {
  const dedupeKey = buildDedupeKey(name, communeName)
  const matchedOn: string[] = []
  let score = 0
  let listingId: string | null = null

  try {
    // 1. Exact dedupe key match (name + commune)
    const keyRes = await pool.query(
      `SELECT l.id FROM listings l
       JOIN communes c ON l.commune_id = c.id
       WHERE lower(regexp_replace(l.title, '[^a-zA-Z0-9]', '', 'g')) =
             lower(regexp_replace($1, '[^a-zA-Z0-9]', '', 'g'))
       AND c.slug = $2
       LIMIT 1`,
      [name, communeName.toLowerCase().replace(/\s+/g, '-')]
    )
    if (keyRes.rows[0]) {
      listingId = keyRes.rows[0].id
      matchedOn.push('name+commune')
      score += 80
    }

    // 2. Phone match
    if (phone && score < 80) {
      const phoneRes = await pool.query(
        `SELECT id FROM listings WHERE contact_phone = $1 LIMIT 1`,
        [phone]
      )
      if (phoneRes.rows[0]) {
        listingId = phoneRes.rows[0].id
        matchedOn.push('phone')
        score += 80
      }
    }

    // 3. Website match
    if (website && score < 80) {
      const webRes = await pool.query(
        `SELECT id FROM listings WHERE website_url = $1 LIMIT 1`,
        [website]
      )
      if (webRes.rows[0]) {
        listingId = webRes.rows[0].id
        matchedOn.push('website')
        score += 70
      }
    }

    // 4. Geo proximity (150m)
    if (lat && lng && score < 50) {
      const geoRes = await pool.query(
        `SELECT l.id FROM listings l
         WHERE l.geo IS NOT NULL
         AND ST_DWithin(l.geo::geography, ST_MakePoint($1,$2)::geography, 150)
         AND similarity(lower(l.title), lower($3)) > 0.4
         LIMIT 1`,
        [lng, lat, name]
      )
      if (geoRes.rows[0]) {
        listingId = geoRes.rows[0].id
        matchedOn.push('geo+name')
        score += 60
      }
    }
  } catch {
    // DB unavailable — skip deduplication
  }

  return {
    isDuplicate: score >= 60,
    listingId,
    score,
    matchedOn,
  }
}

export function buildBatchDedupeKey(name: string, commune: string): string {
  return buildDedupeKey(name, commune)
}
