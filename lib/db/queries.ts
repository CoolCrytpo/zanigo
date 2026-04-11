import pool from '@/lib/db/client'
import type {
  Listing,
  ListingCategory,
  Commune,
  AdSlot,
  Campaign,
  PaginatedResult,
  SearchParams,
  ReactionType,
  ReactionCounts,
  Contribution,
  ContributionStatus,
} from '@/lib/types'

// ─────────────────────────────────────────────
// Communes
// ─────────────────────────────────────────────

export async function getAllCommunes(): Promise<Commune[]> {
  const result = await pool.query<Commune>(
    `SELECT id, slug, name FROM communes ORDER BY name`
  )
  return result.rows
}

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

export async function getAllCategories(): Promise<ListingCategory[]> {
  const result = await pool.query<ListingCategory>(
    `SELECT id, slug, label, icon, listing_type, sort_order
     FROM listing_categories
     ORDER BY sort_order, label`
  )
  return result.rows
}

export async function getCategoriesByType(type: string): Promise<ListingCategory[]> {
  const result = await pool.query<ListingCategory>(
    `SELECT id, slug, label, icon, listing_type, sort_order
     FROM listing_categories
     WHERE listing_type = $1
     ORDER BY sort_order, label`,
    [type]
  )
  return result.rows
}

// ─────────────────────────────────────────────
// Listings — shared select fragment
// ─────────────────────────────────────────────

const LISTING_SELECT = `
  l.id, l.type, l.slug, l.title,
  l.short_description, l.long_description,
  l.commune_id, l.address, l.lat, l.lng,
  l.dog_policy_status, l.dog_policy_rules,
  l.trust_level, l.verified_at,
  l.verification_status,
  l.is_published, l.is_featured, l.is_sponsored, l.campaign_id,
  l.contact_phone, l.contact_email, l.website_url, l.social_urls,
  l.trail_details,
  l.created_at, l.updated_at,
  row_to_json(c.*) AS commune,
  row_to_json(cat.*) AS category,
  (
    SELECT json_agg(p.* ORDER BY p.sort_order)
    FROM listing_photos p
    WHERE p.listing_id = l.id
  ) AS photos,
  (
    SELECT url FROM listing_photos
    WHERE listing_id = l.id AND is_cover = true
    LIMIT 1
  ) AS cover_url,
  (
    SELECT COUNT(*) FROM source_evidences
    WHERE listing_id = l.id
  )::int AS source_count
`

function toIso(v: unknown): string | null {
  if (!v) return null
  if (v instanceof Date) return v.toISOString()
  return String(v)
}

function buildListingRow(row: Record<string, unknown>): Listing {
  return {
    ...row,
    commune: row.commune as Listing['commune'],
    category: row.category as Listing['category'],
    photos: (row.photos as Listing['photos']) ?? [],
    amenities: [],
    trail_details: (row.trail_details as Listing['trail_details']) ?? null,
    social_urls: (row.social_urls as Listing['social_urls']) ?? null,
    verified_at: toIso(row.verified_at),
    created_at: toIso(row.created_at) ?? '',
    updated_at: toIso(row.updated_at) ?? '',
  } as unknown as Listing
}

// ─────────────────────────────────────────────
// Published listings
// ─────────────────────────────────────────────

export async function getPublishedListings(
  params: SearchParams & { listing_type?: string }
): Promise<PaginatedResult<Listing>> {
  const { q, commune_slug, dog_policy, category_slug, listing_type, page = 1, per_page = 24 } = params
  const offset = (page - 1) * per_page

  const conditions: string[] = ['l.is_published = true']
  const values: unknown[] = []
  let idx = 1

  if (listing_type) {
    conditions.push(`l.type = $${idx++}`)
    values.push(listing_type)
  }
  if (q) {
    conditions.push(`(l.title ILIKE $${idx} OR l.short_description ILIKE $${idx})`)
    values.push(`%${q}%`)
    idx++
  }
  if (commune_slug) {
    conditions.push(`c.slug = $${idx++}`)
    values.push(commune_slug)
  }
  if (dog_policy) {
    conditions.push(`l.dog_policy_status = $${idx++}`)
    values.push(dog_policy)
  }
  if (category_slug) {
    conditions.push(`cat.slug = $${idx++}`)
    values.push(category_slug)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT ${LISTING_SELECT}
       FROM listings l
       LEFT JOIN communes c ON l.commune_id = c.id
       LEFT JOIN listing_categories cat ON l.category_id = cat.id
       ${where}
       ORDER BY l.is_featured DESC, l.updated_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, per_page, offset]
    ),
    pool.query(
      `SELECT COUNT(*) FROM listings l
       LEFT JOIN communes c ON l.commune_id = c.id
       LEFT JOIN listing_categories cat ON l.category_id = cat.id
       ${where}`,
      values
    ),
  ])

  return {
    items: dataResult.rows.map(buildListingRow),
    total: parseInt(countResult.rows[0].count),
    page,
    per_page,
  }
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const result = await pool.query(
    `SELECT ${LISTING_SELECT}
     FROM listings l
     LEFT JOIN communes c ON l.commune_id = c.id
     LEFT JOIN listing_categories cat ON l.category_id = cat.id
     WHERE l.slug = $1 AND l.is_published = true`,
    [slug]
  )
  if (!result.rows[0]) return null

  // Fetch amenities separately
  const amenities = await pool.query(
    `SELECT a.* FROM listing_amenities a
     JOIN listing_to_amenities lta ON lta.amenity_id = a.id
     WHERE lta.listing_id = $1`,
    [result.rows[0].id]
  )

  const listing = buildListingRow(result.rows[0])
  listing.amenities = amenities.rows
  return listing
}

// ─────────────────────────────────────────────
// Admin listings
// ─────────────────────────────────────────────

export async function getAdminListings(params: {
  q?: string
  status?: string
  type?: string
  page?: number
  per_page?: number
}): Promise<PaginatedResult<Listing>> {
  const { q, status, type, page = 1, per_page = 30 } = params
  const offset = (page - 1) * per_page

  const conditions: string[] = ['1=1']
  const values: unknown[] = []
  let idx = 1

  if (q) {
    conditions.push(`(l.title ILIKE $${idx} OR l.slug ILIKE $${idx})`)
    values.push(`%${q}%`)
    idx++
  }
  if (status) {
    conditions.push(`l.verification_status = $${idx++}`)
    values.push(status)
  }
  if (type) {
    conditions.push(`l.type = $${idx++}`)
    values.push(type)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT ${LISTING_SELECT}
       FROM listings l
       LEFT JOIN communes c ON l.commune_id = c.id
       LEFT JOIN listing_categories cat ON l.category_id = cat.id
       ${where}
       ORDER BY l.updated_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, per_page, offset]
    ),
    pool.query(
      `SELECT COUNT(*) FROM listings l
       LEFT JOIN communes c ON l.commune_id = c.id
       LEFT JOIN listing_categories cat ON l.category_id = cat.id
       ${where}`,
      values
    ),
  ])

  return {
    items: dataResult.rows.map(buildListingRow),
    total: parseInt(countResult.rows[0].count),
    page,
    per_page,
  }
}

// ─────────────────────────────────────────────
// Admin — get single listing (any status)
// ─────────────────────────────────────────────

export async function getAdminListingById(id: string): Promise<Listing | null> {
  const result = await pool.query(
    `SELECT ${LISTING_SELECT}
     FROM listings l
     LEFT JOIN communes c ON l.commune_id = c.id
     LEFT JOIN listing_categories cat ON l.category_id = cat.id
     WHERE l.id = $1`,
    [id]
  )
  if (!result.rows[0]) return null
  const amenities = await pool.query(
    `SELECT a.* FROM listing_amenities a
     JOIN listing_to_amenities lta ON lta.amenity_id = a.id
     WHERE lta.listing_id = $1`,
    [id]
  )
  const listing = buildListingRow(result.rows[0])
  listing.amenities = amenities.rows
  return listing
}

export type ListingUpsert = {
  type: string
  slug: string
  title: string
  short_description?: string | null
  long_description?: string | null
  commune_id?: string | null
  category_id?: string | null
  address?: string | null
  lat?: number | null
  lng?: number | null
  dog_policy_status: string
  dog_policy_rules?: string | null
  trust_level: string
  verified_at?: string | null
  verification_status: string
  is_published: boolean
  is_featured: boolean
  contact_phone?: string | null
  contact_email?: string | null
  website_url?: string | null
  trail_details?: Record<string, unknown> | null
}

export async function upsertListing(id: string | null, data: ListingUpsert): Promise<string> {
  const geo = data.lat && data.lng
    ? `ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326)`
    : 'NULL'

  if (id) {
    // UPDATE
    const result = await pool.query<{ id: string }>(
      `UPDATE listings SET
        type = $1, slug = $2, title = $3,
        short_description = $4, long_description = $5,
        commune_id = $6, category_id = $7,
        address = $8, lat = $9, lng = $10,
        geo = ${geo},
        dog_policy_status = $11, dog_policy_rules = $12,
        trust_level = $13, verified_at = $14,
        verification_status = $15,
        is_published = $16, is_featured = $17,
        contact_phone = $18, contact_email = $19,
        website_url = $20, trail_details = $21,
        updated_at = now(),
        published_at = CASE WHEN $16 = true AND published_at IS NULL THEN now() ELSE published_at END
       WHERE id = $22
       RETURNING id`,
      [
        data.type, data.slug, data.title,
        data.short_description ?? null, data.long_description ?? null,
        data.commune_id ?? null, data.category_id ?? null,
        data.address ?? null, data.lat ?? null, data.lng ?? null,
        data.dog_policy_status, data.dog_policy_rules ?? null,
        data.trust_level, data.verified_at ?? null,
        data.verification_status,
        data.is_published, data.is_featured,
        data.contact_phone ?? null, data.contact_email ?? null,
        data.website_url ?? null,
        data.trail_details ? JSON.stringify(data.trail_details) : null,
        id,
      ]
    )
    return result.rows[0].id
  } else {
    // INSERT
    const result = await pool.query<{ id: string }>(
      `INSERT INTO listings (
        type, slug, title,
        short_description, long_description,
        commune_id, category_id,
        address, lat, lng, geo,
        dog_policy_status, dog_policy_rules,
        trust_level, verified_at,
        verification_status,
        is_published, is_featured,
        contact_phone, contact_email, website_url, trail_details,
        published_at
       ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ${geo},
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
        CASE WHEN $16 = true THEN now() ELSE NULL END
       ) RETURNING id`,
      [
        data.type, data.slug, data.title,
        data.short_description ?? null, data.long_description ?? null,
        data.commune_id ?? null, data.category_id ?? null,
        data.address ?? null, data.lat ?? null, data.lng ?? null,
        data.dog_policy_status, data.dog_policy_rules ?? null,
        data.trust_level, data.verified_at ?? null,
        data.verification_status,
        data.is_published, data.is_featured,
        data.contact_phone ?? null, data.contact_email ?? null,
        data.website_url ?? null,
        data.trail_details ? JSON.stringify(data.trail_details) : null,
      ]
    )
    return result.rows[0].id
  }
}

// ─────────────────────────────────────────────
// Reactions
// ─────────────────────────────────────────────

export async function getReactionCounts(listingId: string): Promise<ReactionCounts> {
  const result = await pool.query<{ type: ReactionType; count: string }>(
    `SELECT type, COUNT(*)::int as count
     FROM reactions
     WHERE listing_id = $1
     GROUP BY type`,
    [listingId]
  )
  const counts: ReactionCounts = { useful: 0, thanks: 0, love: 0, oops: 0 }
  for (const row of result.rows) {
    counts[row.type] = parseInt(row.count)
  }
  return counts
}

export async function addReaction(listingId: string, type: ReactionType, anonHash: string): Promise<void> {
  await pool.query(
    `INSERT INTO reactions (listing_id, type, anon_hash) VALUES ($1, $2, $3)
     ON CONFLICT (listing_id, type, anon_hash) DO NOTHING`,
    [listingId, type, anonHash]
  )
}

export async function removeReaction(listingId: string, type: ReactionType, anonHash: string): Promise<void> {
  await pool.query(
    `DELETE FROM reactions WHERE listing_id = $1 AND type = $2 AND anon_hash = $3`,
    [listingId, type, anonHash]
  )
}

// ─────────────────────────────────────────────
// Ad slots / Campaigns
// ─────────────────────────────────────────────

export async function getActiveAdSlot(slotKey: string): Promise<AdSlot | null> {
  const result = await pool.query(
    `SELECT s.*, row_to_json(c.*) AS campaign
     FROM ad_slots s
     LEFT JOIN campaigns c ON s.campaign_id = c.id
     WHERE s.slot_key = $1
       AND s.is_active = true
       AND (s.campaign_id IS NULL OR (
         c.is_active = true
         AND (c.starts_at IS NULL OR c.starts_at <= now())
         AND (c.ends_at IS NULL OR c.ends_at >= now())
       ))
     LIMIT 1`,
    [slotKey]
  )
  if (!result.rows[0]) return null
  return {
    ...result.rows[0],
    campaign: result.rows[0].campaign as Campaign | null,
  }
}

// ─────────────────────────────────────────────
// Contributions
// ─────────────────────────────────────────────

export async function createContribution(params: {
  listing_id?: string
  type: string
  data: Record<string, unknown>
  submitter_anon?: string
}): Promise<string> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO contributions (listing_id, type, data, submitter_anon)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [params.listing_id ?? null, params.type, JSON.stringify(params.data), params.submitter_anon ?? null]
  )
  return result.rows[0].id
}

export async function getPendingContributions(params: {
  page?: number
  per_page?: number
}): Promise<PaginatedResult<Contribution>> {
  const { page = 1, per_page = 30 } = params
  const offset = (page - 1) * per_page

  const [dataResult, countResult] = await Promise.all([
    pool.query<Contribution>(
      `SELECT * FROM contributions
       WHERE status = 'pending'
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [per_page, offset]
    ),
    pool.query(`SELECT COUNT(*) FROM contributions WHERE status = 'pending'`),
  ])

  return {
    items: dataResult.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    per_page,
  }
}

export async function updateContributionStatus(
  id: string,
  status: ContributionStatus,
  reviewedBy: string
): Promise<void> {
  await pool.query(
    `UPDATE contributions SET status = $1, reviewed_by = $2, reviewed_at = now() WHERE id = $3`,
    [status, reviewedBy, id]
  )
}
