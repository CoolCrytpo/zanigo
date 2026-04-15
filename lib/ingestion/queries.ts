// ─────────────────────────────────────────────
// ZaniGo — Ingestion DB queries
// ─────────────────────────────────────────────
import pool from '@/lib/db/client'
import type { ImportBatch, StagingListing, ListingRequest } from './types'
import type { ExtractedItem } from './types'
import { buildDedupeKey, normalizeItem } from './normalizer'
import { detectDuplicate } from './deduplication'

// ── Batches ───────────────────────────────────

export async function createBatch(
  sourceType: 'url' | 'csv' | 'manual',
  label: string,
  userId: string | null,
): Promise<ImportBatch> {
  const r = await pool.query(
    `INSERT INTO import_batches (source_type, label, created_by, status)
     VALUES ($1, $2, $3, 'pending_analysis') RETURNING *`,
    [sourceType, label, userId]
  )
  return r.rows[0]
}

export async function updateBatchStatus(
  batchId: string,
  status: ImportBatch['status'],
  counts?: Partial<Pick<ImportBatch, 'total_sources' | 'total_extracted' | 'total_imported' | 'total_rejected' | 'total_duplicates'>>,
): Promise<void> {
  await pool.query(
    `UPDATE import_batches SET status=$1,
      total_sources=COALESCE($2, total_sources),
      total_extracted=COALESCE($3, total_extracted),
      total_imported=COALESCE($4, total_imported),
      total_rejected=COALESCE($5, total_rejected),
      total_duplicates=COALESCE($6, total_duplicates),
      updated_at=now()
     WHERE id=$7`,
    [status, counts?.total_sources, counts?.total_extracted,
     counts?.total_imported, counts?.total_rejected, counts?.total_duplicates, batchId]
  )
}

export async function getBatches(limit = 20): Promise<ImportBatch[]> {
  const r = await pool.query(
    `SELECT * FROM import_batches ORDER BY created_at DESC LIMIT $1`,
    [limit]
  )
  return r.rows
}

export async function getBatch(id: string): Promise<ImportBatch | null> {
  const r = await pool.query(`SELECT * FROM import_batches WHERE id=$1`, [id])
  return r.rows[0] ?? null
}

// ── Staging ───────────────────────────────────

export async function insertStagingItem(
  item: ExtractedItem,
  batchId: string,
  sourceId: string | null,
  userId: string | null,
): Promise<string> {
  const normalized = normalizeItem(item)
  const dedupeKey = buildDedupeKey(normalized.name, normalized.commune_name ?? '')
  const dupe = await detectDuplicate(
    normalized.name, normalized.commune_name ?? '',
    normalized.phone, normalized.website, normalized.lat, normalized.lng,
  )

  const status = dupe.isDuplicate ? 'duplicate_suspected' : 'to_review'

  const r = await pool.query(
    `INSERT INTO staging_listings
       (batch_id, source_id, name, category, commune_name, address, phone, email, website,
        dog_policy, dog_policy_detail, inside_allowed, terrace_only, leash_required, extra_fee,
        proof_excerpt, confidence_score, source_url, source_domain, source_page_type,
        dedupe_key, duplicate_of_listing_id, duplicate_score, status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
     RETURNING id`,
    [
      batchId, sourceId ?? null, normalized.name, normalized.category ?? null, normalized.commune_name ?? null,
      normalized.address ?? null, normalized.phone ?? null, normalized.email ?? null, normalized.website ?? null,
      normalized.dog_policy, normalized.dog_policy_detail ?? null,
      normalized.inside_allowed ?? 'unknown', normalized.terrace_only ?? 'unknown',
      normalized.leash_required ?? 'unknown', normalized.extra_fee ?? 'unknown',
      normalized.proof_excerpt ?? null, normalized.confidence_score,
      normalized.source_url, normalized.source_domain, normalized.source_page_type,
      dedupeKey, dupe.listingId, dupe.score, status, userId,
    ]
  )
  return r.rows[0].id
}

export async function getStagingListings(filters: {
  status?: string; batch_id?: string; commune?: string;
  q?: string; duplicate_only?: boolean;
  page?: number; per_page?: number;
}): Promise<{ items: StagingListing[]; total: number }> {
  const { status, batch_id, commune, q, duplicate_only, page = 1, per_page = 30 } = filters
  const conditions: string[] = []
  const params: unknown[] = []
  let i = 1
  if (status) { conditions.push(`status=$${i++}`); params.push(status) }
  if (batch_id) { conditions.push(`batch_id=$${i++}`); params.push(batch_id) }
  if (commune) { conditions.push(`commune_name ILIKE $${i++}`); params.push(`%${commune}%`) }
  if (q) { conditions.push(`name ILIKE $${i++}`); params.push(`%${q}%`) }
  if (duplicate_only) { conditions.push(`duplicate_of_listing_id IS NOT NULL`) }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
  const offset = (page - 1) * per_page
  const [dataRes, countRes] = await Promise.all([
    pool.query(`SELECT * FROM staging_listings ${where} ORDER BY confidence_score DESC, created_at DESC LIMIT $${i} OFFSET $${i + 1}`, [...params, per_page, offset]),
    pool.query(`SELECT COUNT(*) FROM staging_listings ${where}`, params),
  ])
  return { items: dataRes.rows, total: parseInt(countRes.rows[0].count) }
}

export async function getStagingById(id: string): Promise<StagingListing | null> {
  const r = await pool.query(`SELECT * FROM staging_listings WHERE id=$1`, [id])
  return r.rows[0] ?? null
}

export async function updateStaging(id: string, data: Partial<StagingListing>): Promise<void> {
  const fields = Object.keys(data).filter(k => k !== 'id')
  if (!fields.length) return
  const set = fields.map((f, i) => `${f}=$${i + 1}`).join(', ')
  const vals = fields.map(f => (data as Record<string, unknown>)[f])
  await pool.query(
    `UPDATE staging_listings SET ${set}, updated_at=now() WHERE id=$${fields.length + 1}`,
    [...vals, id]
  )
}

export async function approveStagingItem(id: string, userId: string): Promise<string> {
  const s = await getStagingById(id)
  if (!s) throw new Error('Staging item not found')

  // Map dog_policy to listing enum
  const policyMap: Record<string, string> = { yes: 'allowed', no: 'disallowed', conditional: 'conditional', unknown: 'unknown' }
  const dogPolicy = policyMap[s.dog_policy] ?? 'unknown'

  // Find commune_id if possible
  let communeId: string | null = null
  if (s.commune_name) {
    const cr = await pool.query(
      `SELECT id FROM communes WHERE name ILIKE $1 OR slug ILIKE $2 LIMIT 1`,
      [s.commune_name, s.commune_name.toLowerCase().replace(/\s+/g, '-')]
    )
    communeId = cr.rows[0]?.id ?? null
  }

  const slug = s.name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36)

  const res = await pool.query(
    `INSERT INTO listings
       (type, slug, title, commune_id, address, contact_phone, contact_email, website_url,
        dog_policy_status, dog_policy_rules, trust_level, verification_status,
        is_published, verified_at)
     VALUES ('place', $1, $2, $3, $4, $5, $6, $7, $8, $9, 'low', 'pending_review', false, now())
     RETURNING id`,
    [slug, s.name, communeId, s.address, s.phone, s.email, s.website,
     dogPolicy, s.dog_policy_detail]
  )
  const listingId = res.rows[0].id

  await pool.query(
    `UPDATE staging_listings SET status='published', published_listing_id=$1, reviewed_by=$2, updated_at=now() WHERE id=$3`,
    [listingId, userId, id]
  )

  // Store source evidence
  if (s.source_url) {
    await pool.query(
      `INSERT INTO source_evidences (listing_id, source_type, source_url, excerpt, captured_at)
       VALUES ($1,'other',$2,$3,now())`,
      [listingId, s.source_url, s.proof_excerpt]
    )
  }

  return listingId
}

export async function rejectStagingItem(id: string, userId: string, reason: string): Promise<void> {
  await pool.query(
    `UPDATE staging_listings SET status='rejected', rejection_reason=$1, reviewed_by=$2, updated_at=now() WHERE id=$3`,
    [reason, userId, id]
  )
}

// ── Listing Requests ──────────────────────────

export async function createListingRequest(data: {
  listing_id?: string; listing_slug?: string;
  request_type: ListingRequest['request_type'];
  requester_name: string; requester_email: string; requester_role?: string;
  request_reason?: string; request_message: string; proof_url?: string;
}): Promise<string> {
  const r = await pool.query(
    `INSERT INTO listing_requests
       (listing_id, listing_slug, request_type, requester_name, requester_email,
        requester_role, request_reason, request_message, proof_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [data.listing_id ?? null, data.listing_slug ?? null, data.request_type,
     data.requester_name, data.requester_email, data.requester_role ?? null,
     data.request_reason ?? null, data.request_message, data.proof_url ?? null]
  )
  return r.rows[0].id
}

export async function getListingRequests(filters: {
  status?: string; type?: string; page?: number; per_page?: number;
}): Promise<{ items: ListingRequest[]; total: number }> {
  const { status, type, page = 1, per_page = 30 } = filters
  const conditions: string[] = []
  const params: unknown[] = []
  let i = 1
  if (status) { conditions.push(`status=$${i++}`); params.push(status) }
  if (type) { conditions.push(`request_type=$${i++}`); params.push(type) }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
  const offset = (page - 1) * per_page
  const [dataRes, countRes] = await Promise.all([
    pool.query(`SELECT * FROM listing_requests ${where} ORDER BY received_at DESC LIMIT $${i} OFFSET $${i + 1}`, [...params, per_page, offset]),
    pool.query(`SELECT COUNT(*) FROM listing_requests ${where}`, params),
  ])
  return { items: dataRes.rows, total: parseInt(countRes.rows[0].count) }
}

export async function getListingRequestById(id: string): Promise<ListingRequest | null> {
  const r = await pool.query(`SELECT * FROM listing_requests WHERE id=$1`, [id])
  return r.rows[0] ?? null
}

export async function updateListingRequest(id: string, data: {
  status?: ListingRequest['status']; admin_response?: string; handled_by?: string; resolved_at?: string;
}): Promise<void> {
  await pool.query(
    `UPDATE listing_requests SET
       status=COALESCE($1, status),
       admin_response=COALESCE($2, admin_response),
       handled_by=COALESCE($3, handled_by),
       resolved_at=COALESCE($4, resolved_at),
       updated_at=now()
     WHERE id=$5`,
    [data.status ?? null, data.admin_response ?? null, data.handled_by ?? null, data.resolved_at ?? null, id]
  )
}
