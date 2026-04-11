import pool from '@/lib/db/client'
import type { SearchParams, PaginatedResult } from '@/lib/types'
import { LISTING_TYPE_PATHS } from '@/config/constants'

export interface SearchResult {
  id: string
  type: string
  slug: string
  title: string
  short_description: string | null
  commune_name: string | null
  commune_slug: string | null
  category_label: string | null
  category_icon: string | null
  dog_policy_status: string
  trust_level: string
  is_featured: boolean
  is_sponsored: boolean
  cover_url: string | null
  address: string | null
  lat: number | null
  lng: number | null
  href: string
  rank?: number
}

export async function searchListings(
  params: SearchParams
): Promise<PaginatedResult<SearchResult>> {
  const {
    q,
    type,
    commune_slug,
    dog_policy,
    category_slug,
    lat,
    lng,
    radius_km,
    page = 1,
    per_page = 24,
  } = params

  const offset = (page - 1) * per_page
  const conditions: string[] = ['l.is_published = true']
  const values: unknown[] = []
  let idx = 1

  // Full-text search
  let rankExpr = '1'
  if (q && q.trim()) {
    const tsQuery = q.trim().split(/\s+/).map((w) => `${w}:*`).join(' & ')
    conditions.push(`(
      l.search_vector @@ to_tsquery('french', $${idx})
      OR l.title ILIKE $${idx + 1}
    )`)
    values.push(tsQuery)
    values.push(`%${q.trim()}%`)
    rankExpr = `ts_rank(l.search_vector, to_tsquery('french', $${idx}))`
    idx += 2
  }

  if (type) {
    conditions.push(`l.type = $${idx++}`)
    values.push(type)
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

  // Geo filter
  if (lat && lng && radius_km) {
    conditions.push(
      `ST_DWithin(
        l.geo::geography,
        ST_SetSRID(ST_MakePoint($${idx + 1}, $${idx}), 4326)::geography,
        $${idx + 2}
      )`
    )
    values.push(lat, lng, radius_km * 1000)
    idx += 3
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT
        l.id, l.type, l.slug, l.title,
        l.short_description, l.address,
        l.lat, l.lng,
        l.dog_policy_status, l.trust_level,
        l.is_featured, l.is_sponsored,
        c.name AS commune_name, c.slug AS commune_slug,
        cat.label AS category_label, cat.icon AS category_icon,
        (SELECT url FROM listing_photos WHERE listing_id = l.id AND is_cover = true LIMIT 1) AS cover_url,
        ${rankExpr} AS rank
       FROM listings l
       LEFT JOIN communes c ON l.commune_id = c.id
       LEFT JOIN listing_categories cat ON l.category_id = cat.id
       ${where}
       ORDER BY l.is_featured DESC, rank DESC, l.updated_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, per_page, offset]
    ),
    pool.query(
      `SELECT COUNT(*)
       FROM listings l
       LEFT JOIN communes c ON l.commune_id = c.id
       LEFT JOIN listing_categories cat ON l.category_id = cat.id
       ${where}`,
      values
    ),
  ])

  const items: SearchResult[] = dataResult.rows.map((row) => ({
    ...row,
    href: `${LISTING_TYPE_PATHS[row.type as string] ?? '/lieux'}/${row.slug}`,
  }))

  return {
    items,
    total: parseInt(countResult.rows[0].count),
    page,
    per_page,
  }
}
