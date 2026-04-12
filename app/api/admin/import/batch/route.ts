import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { analyzeUrl } from '@/lib/ingestion/extractor'
import { normalizeItem } from '@/lib/ingestion/normalizer'
import { parseCsv, mapCsvRowToStaging } from '@/lib/ingestion/csv'
import {
  createBatch, updateBatchStatus, createSource, insertStagingItem, getBatches,
} from '@/lib/ingestion/queries'

// GET — list batches
export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const batches = await getBatches(30)
  return NextResponse.json({ batches })
}

// POST — create batch from URLs or CSV
export async function POST(req: NextRequest) {
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

    let imported = 0; let rejected = 0
    for (const row of rows) {
      const mapped = mapCsvRowToStaging(row)
      if (!mapped.name) { rejected++; continue }
      try {
        const item = {
          name: mapped.name!,
          dog_policy: (mapped.dog_policy ?? 'unknown') as 'yes' | 'no' | 'conditional' | 'unknown',
          confidence_score: mapped.confidence_score ?? 30,
          source_url: mapped.source_url ?? '',
          source_domain: mapped.source_domain ?? '',
          source_page_type: 'unknown' as const,
          commune_name: mapped.commune_name ?? undefined,
          address: mapped.address ?? undefined,
          phone: mapped.phone ?? undefined,
          email: mapped.email ?? undefined,
          website: mapped.website ?? undefined,
          category: mapped.category ?? undefined,
          dog_policy_detail: mapped.dog_policy_detail ?? undefined,
          proof_excerpt: mapped.proof_excerpt ?? undefined,
        }
        const normalized = normalizeItem(item)
        const sourceId = await createSource(batch.id, mapped.source_url ?? 'csv', mapped.source_domain ?? 'csv', 'detail', 'medium', 'compatible', 1)
        await insertStagingItem(normalized, batch.id, sourceId, user.id)
        imported++
      } catch { rejected++ }
    }

    await updateBatchStatus(batch.id, imported > 0 ? 'imported_to_staging' : 'failed', {
      total_sources: 1, total_extracted: rows.length, total_imported: imported, total_rejected: rejected,
    })

    return NextResponse.json({ batch_id: batch.id, imported, rejected, parse_errors: errors })
  }

  // ── URL or Manual import ──────────────────────────────
  const body = await req.json() as {
    urls?: string[]
    items?: Array<{
      name: string; category?: string; commune?: string
      phone?: string; website?: string; dog_policy?: string
    }>
    rows?: Array<Record<string, string>>
    label?: string
    source_type?: string
    source_url?: string
  }

  // ── XLSX / Google Sheet rows (column-mapped) ──────────────────────────────
  if (body.rows && Array.isArray(body.rows)) {
    const { rows, label, source_type: srcType } = body
    const batch = await createBatch((srcType ?? 'manual_csv') as 'csv', label ?? 'XLSX import', user.id)
    let imported = 0; let rejected = 0

    for (const row of rows) {
      const name = row.name?.trim()
      if (!name) { rejected++; continue }
      try {
        const sourceId = await createSource(
          batch.id, 'xlsx', 'xlsx', 'detail', 'medium', 'compatible', 1
        )
        await insertStagingItem({
          name,
          dog_policy: (['yes', 'no', 'conditional', 'unknown'].includes(row.dog_policy ?? '')
            ? row.dog_policy as 'yes' | 'no' | 'conditional' | 'unknown'
            : 'unknown'),
          confidence_score: 30,
          source_url: 'xlsx',
          source_domain: 'xlsx',
          source_page_type: 'detail',
          commune_name: row.commune || undefined,
          address: row.address || undefined,
          phone: row.phone || undefined,
          email: row.email || undefined,
          website: row.website || undefined,
          category: row.category || undefined,
          dog_policy_detail: row.description || undefined,
        }, batch.id, sourceId, user.id)
        imported++
      } catch { rejected++ }
    }

    await updateBatchStatus(batch.id, imported > 0 ? 'imported_to_staging' : 'failed', {
      total_sources: 1, total_extracted: rows.length,
      total_imported: imported, total_rejected: rejected, total_duplicates: 0,
    })

    return NextResponse.json({ batch_id: batch.id, imported, rejected })
  }

  // Manual items (quick entry form)
  if (body.items && Array.isArray(body.items)) {
    const { items, label, source_url } = body
    const sourceDomain = source_url
      ? (() => { try { return new URL(source_url).hostname.replace(/^www\./, '') } catch { return 'manual' } })()
      : 'manual'

    const batch = await createBatch('manual', label ?? 'Saisie manuelle', user.id)
    let imported = 0; let rejected = 0

    for (const item of items) {
      if (!item.name?.trim()) { rejected++; continue }
      try {
        const sourceId = await createSource(
          batch.id, source_url ?? 'manual', sourceDomain,
          'detail', 'medium', 'compatible', 1
        )
        await insertStagingItem({
          name: item.name.trim(),
          dog_policy: (item.dog_policy ?? 'unknown') as 'yes' | 'no' | 'conditional' | 'unknown',
          confidence_score: 35,
          source_url: source_url ?? 'manual',
          source_domain: sourceDomain,
          source_page_type: 'detail',
          commune_name: item.commune || undefined,
          phone: item.phone || undefined,
          website: item.website || undefined,
          category: item.category || undefined,
        }, batch.id, sourceId, user.id)
        imported++
      } catch { rejected++ }
    }

    await updateBatchStatus(batch.id, imported > 0 ? 'imported_to_staging' : 'failed', {
      total_sources: 1, total_extracted: items.length,
      total_imported: imported, total_rejected: rejected, total_duplicates: 0,
    })

    return NextResponse.json({ batch_id: batch.id, imported, rejected })
  }

  // URL import
  const { urls, label } = body
  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: 'urls requis' }, { status: 400 })
  }

  const batch = await createBatch('url', label ?? `Import URLs ${new Date().toLocaleDateString('fr-FR')}`, user.id)

  let totalExtracted = 0; let totalImported = 0; let totalRejected = 0; let totalDuplicates = 0

  for (const url of urls) {
    try {
      const result = await analyzeUrl(url)
      const sourceId = await createSource(
        batch.id, url, result.domain, result.page_type,
        result.compatibility, result.status, result.items_found,
        result.error_message, result.raw_excerpt
      )
      totalExtracted += result.items.length
      for (const item of result.items) {
        try {
          await insertStagingItem(item, batch.id, sourceId, user.id)
          totalImported++
        } catch { totalRejected++ }
      }
    } catch { totalRejected++ }
  }

  await updateBatchStatus(batch.id, 'imported_to_staging', {
    total_sources: urls.length, total_extracted: totalExtracted,
    total_imported: totalImported, total_rejected: totalRejected,
    total_duplicates: totalDuplicates,
  })

  return NextResponse.json({ batch_id: batch.id, total_imported: totalImported, total_rejected: totalRejected })
}
