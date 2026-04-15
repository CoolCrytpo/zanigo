import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { analyzeUrl } from '@/lib/ingestion/extractor'
import { normalizeItem, buildDedupeKey } from '@/lib/ingestion/normalizer'
import { parseCsv, mapCsvRowToStaging } from '@/lib/ingestion/csv'
import pool from '@/lib/db/client'
import {
  createBatch, updateBatchStatus, insertStagingItem, getBatches,
} from '@/lib/ingestion/queries'

// Bulk insert staging items without per-row duplicate detection (fast path for CSV/XLSX)
async function bulkInsertStaging(
  items: Array<{
    name: string; category?: string; commune_name?: string; address?: string
    phone?: string; email?: string; website?: string; dog_policy?: string
    dog_policy_detail?: string; inside_allowed?: string; terrace_only?: string
    leash_required?: string; extra_fee?: string
    confidence_score?: number; source_url?: string; source_domain?: string
    proof_excerpt?: string
  }>,
  batchId: string,
  userId: string | null,
): Promise<{ imported: number; rejected: number }> {
  if (items.length === 0) return { imported: 0, rejected: 0 }
  const CHUNK = 50
  let imported = 0; let rejected = 0
  const COLS = 23 // params per row

  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK)
    const params: unknown[] = []
    const placeholders = chunk.map((item, j) => {
      const b = j * COLS
      const normalized = normalizeItem({
        name: item.name,
        dog_policy: (item.dog_policy ?? 'unknown') as 'yes' | 'no' | 'conditional' | 'unknown',
        confidence_score: item.confidence_score ?? 30,
        source_url: item.source_url ?? 'csv',
        source_domain: item.source_domain ?? 'csv',
        source_page_type: 'detail',
        commune_name: item.commune_name,
        address: item.address,
        phone: item.phone,
        email: item.email,
        website: item.website,
        category: item.category,
        dog_policy_detail: item.dog_policy_detail,
      })
      params.push(
        batchId, null,
        normalized.name, normalized.category ?? null, normalized.commune_name ?? null,
        normalized.address ?? null, normalized.phone ?? null, normalized.email ?? null,
        normalized.website ?? null,
        normalized.dog_policy,
        item.dog_policy_detail ?? null,
        item.inside_allowed ?? normalized.inside_allowed ?? 'unknown',
        item.terrace_only ?? normalized.terrace_only ?? 'unknown',
        item.leash_required ?? normalized.leash_required ?? 'unknown',
        item.extra_fee ?? normalized.extra_fee ?? 'unknown',
        item.proof_excerpt ?? null,
        normalized.confidence_score,
        normalized.source_url,
        normalized.source_domain,
        normalized.source_page_type,
        'to_review',
        userId,
        buildDedupeKey(normalized.name, normalized.commune_name ?? ''),
      )
      return `($${b+1},$${b+2},$${b+3},$${b+4},$${b+5},$${b+6},$${b+7},$${b+8},$${b+9},$${b+10},$${b+11},$${b+12},$${b+13},$${b+14},$${b+15},$${b+16},$${b+17},$${b+18},$${b+19},$${b+20},$${b+21},$${b+22},$${b+23})`
    }).join(',')

    try {
      await pool.query(
        `INSERT INTO staging_listings
           (batch_id, source_id, name, category, commune_name, address, phone, email, website,
            dog_policy, dog_policy_detail, inside_allowed, terrace_only, leash_required, extra_fee,
            proof_excerpt, confidence_score, source_url, source_domain, source_page_type,
            status, created_by, dedupe_key)
         VALUES ${placeholders}`,
        params
      )
      imported += chunk.length
    } catch { rejected += chunk.length }
  }

  return { imported, rejected }
}

export const maxDuration = 60

// GET — list batches
export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const batches = await getBatches(30)
  return NextResponse.json({ batches })
}

// POST — create batch from URLs or CSV
export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const contentType = req.headers.get('content-type') ?? ''

    // ── CSV import ──────────────────────────────
    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData()
      const file = form.get('csv') as File | null
      const label = (form.get('label') as string) || 'Import CSV'

      if (!file) return NextResponse.json({ error: 'Fichier CSV requis' }, { status: 400 })

      const content = await file.text()
      const { rows, errors } = parseCsv(content)

      const batch = await createBatch('csv', label, user.id)

      const mapped = rows.map(r => mapCsvRowToStaging(r))
      const validRows = mapped.filter(r => !!r.name)
      const skipped = rows.length - validRows.length

      const { imported, rejected } = await bulkInsertStaging(
        validRows.map(r => ({
          name: r.name as string,
          category: r.category || undefined,
          commune_name: r.commune_name || undefined,
          address: r.address || undefined,
          phone: r.phone || undefined,
          email: r.email || undefined,
          website: r.website || undefined,
          dog_policy: r.dog_policy || 'unknown',
          dog_policy_detail: r.dog_policy_detail || undefined,
          inside_allowed: r.inside_allowed || 'unknown',
          terrace_only: r.terrace_only || 'unknown',
          leash_required: r.leash_required || 'unknown',
          extra_fee: r.extra_fee || 'unknown',
          confidence_score: r.confidence_score ?? 30,
          source_url: r.source_url || 'csv',
          source_domain: r.source_domain || 'csv',
          proof_excerpt: r.proof_excerpt || undefined,
        })),
        batch.id, user.id
      )

      await updateBatchStatus(batch.id, imported > 0 ? 'imported_to_staging' : 'failed', {
        total_sources: 1, total_extracted: rows.length, total_imported: imported, total_rejected: rejected + skipped,
      })

      return NextResponse.json({ batch_id: batch.id, imported, rejected: rejected + skipped, parse_errors: errors })
    }

    // ── URL or Manual import ──────────────────────────────
    let body: {
      urls?: string[]
      items?: Array<{ name: string; category?: string; commune?: string; phone?: string; website?: string; dog_policy?: string }>
      rows?: Array<Record<string, string>>
      label?: string
      source_type?: string
      source_url?: string
    }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
    }

    // ── XLSX / Google Sheet rows ──────────────────────────
    if (body.rows && Array.isArray(body.rows)) {
      const { rows, label } = body
      const batch = await createBatch('csv', label ?? 'XLSX import', user.id)

      const validRows = rows.filter(r => !!r.name?.trim())
      const skipped = rows.length - validRows.length

      const { imported, rejected } = await bulkInsertStaging(
        validRows.map(r => ({
          name: r.name.trim(),
          category: r.category || undefined,
          commune_name: r.commune || undefined,
          address: r.address || undefined,
          phone: r.phone || undefined,
          email: r.email || undefined,
          website: r.website || undefined,
          dog_policy: r.dog_policy || 'unknown',
          dog_policy_detail: r.description || undefined,
          confidence_score: 30,
          source_url: 'xlsx',
          source_domain: 'xlsx',
        })),
        batch.id, user.id
      )

      await updateBatchStatus(batch.id, imported > 0 ? 'imported_to_staging' : 'failed', {
        total_sources: 1, total_extracted: rows.length,
        total_imported: imported, total_rejected: rejected + skipped, total_duplicates: 0,
      })

      return NextResponse.json({ batch_id: batch.id, imported, rejected: rejected + skipped })
    }

    // ── Manual items ──────────────────────────────────────
    if (body.items && Array.isArray(body.items)) {
      const { items, label, source_url } = body
      const sourceDomain = source_url
        ? (() => { try { return new URL(source_url).hostname.replace(/^www\./, '') } catch { return 'manual' } })()
        : 'manual'

      const batch = await createBatch('manual', label ?? 'Saisie manuelle', user.id)

      const validItems = items.filter(i => !!i.name?.trim())
      const skipped = items.length - validItems.length

      const { imported, rejected } = await bulkInsertStaging(
        validItems.map(i => ({
          name: i.name.trim(),
          category: i.category || undefined,
          commune_name: i.commune || undefined,
          phone: i.phone || undefined,
          website: i.website || undefined,
          dog_policy: i.dog_policy || 'unknown',
          confidence_score: 35,
          source_url: source_url ?? 'manual',
          source_domain: sourceDomain,
        })),
        batch.id, user.id
      )

      await updateBatchStatus(batch.id, imported > 0 ? 'imported_to_staging' : 'failed', {
        total_sources: 1, total_extracted: items.length,
        total_imported: imported, total_rejected: rejected + skipped, total_duplicates: 0,
      })

      return NextResponse.json({ batch_id: batch.id, imported, rejected: rejected + skipped })
    }

    // ── URL import ────────────────────────────────────────
    const { urls, label } = body
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'urls requis' }, { status: 400 })
    }

    const batch = await createBatch('url', label ?? `Import URLs ${new Date().toLocaleDateString('fr-FR')}`, user.id)
    let totalExtracted = 0; let totalImported = 0; let totalRejected = 0

    for (const url of urls) {
      try {
        const result = await analyzeUrl(url)
        totalExtracted += result.items.length
        for (const item of result.items) {
          try { await insertStagingItem(item, batch.id, null, user.id); totalImported++ }
          catch { totalRejected++ }
        }
      } catch { totalRejected++ }
    }

    await updateBatchStatus(batch.id, 'imported_to_staging', {
      total_sources: urls.length, total_extracted: totalExtracted,
      total_imported: totalImported, total_rejected: totalRejected,
    })

    return NextResponse.json({ batch_id: batch.id, total_imported: totalImported, total_rejected: totalRejected })

  } catch (e) {
    console.error('[import/batch] unhandled error:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur serveur' }, { status: 500 })
  }
}
