// ─────────────────────────────────────────────
// ZaniGo — CSV pivot (no external deps)
// ─────────────────────────────────────────────
import { CSV_COLUMNS } from './types'
import type { StagingListing } from './types'

function escapeCell(val: unknown): string {
  const s = val == null ? '' : String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export function generateCsvTemplate(): string {
  return CSV_COLUMNS.join(',') + '\n'
}

export function stagingToCsvRow(s: StagingListing): string {
  const row = [
    s.external_id ?? '',
    s.source_type_label ?? '',
    s.source_page_type ?? '',
    s.name,
    s.category ?? '',
    s.subcategory ?? '',
    s.commune_name ?? '',
    s.address ?? '',
    s.postal_code ?? '',
    s.lat ?? '',
    s.lng ?? '',
    s.phone ?? '',
    s.email ?? '',
    s.website ?? '',
    s.dog_policy,
    s.dog_policy_detail ?? '',
    s.dog_size_rule ?? '',
    s.inside_allowed,
    s.terrace_only,
    s.leash_required,
    s.extra_fee,
    s.proof_excerpt ?? '',
    s.confidence_score,
    s.status,
    s.admin_notes ?? '',
    s.source_url ?? '',
    s.source_domain ?? '',
    s.batch_id ?? '',
    s.dedupe_key ?? '',
  ]
  return row.map(escapeCell).join(',')
}

export function stagingsToCsv(items: StagingListing[]): string {
  const header = CSV_COLUMNS.join(',')
  const rows = items.map(stagingToCsvRow)
  return [header, ...rows].join('\n')
}

// ── CSV import parser ─────────────────────────

type ParsedRow = Record<string, string>

export function parseCsv(content: string): { headers: string[]; rows: ParsedRow[]; errors: string[] } {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  if (lines.length < 2) return { headers: [], rows: [], errors: ['Fichier vide ou invalide'] }

  const errors: string[] = []
  const headers = splitCsvLine(lines[0])

  const rows: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cells = splitCsvLine(line)
    if (cells.length !== headers.length) {
      errors.push(`Ligne ${i + 1} : ${cells.length} colonnes au lieu de ${headers.length}`)
      continue
    }
    const row: ParsedRow = {}
    headers.forEach((h, j) => { row[h] = cells[j] })
    rows.push(row)
  }
  return { headers, rows, errors }
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      cells.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current)
  return cells
}

export function mapCsvRowToStaging(row: ParsedRow): Partial<StagingListing> {
  // Flexible mapping: support column aliases
  const get = (...keys: string[]) => {
    for (const k of keys) if (row[k] !== undefined && row[k] !== '') return row[k]
    return ''
  }
  return {
    name: get('name','nom','title','titre'),
    category: get('category','categorie','catégorie'),
    subcategory: get('subcategory','sous-categorie'),
    commune_name: get('commune','ville','commune_name'),
    address: get('address','adresse'),
    postal_code: get('postal_code','code_postal','cp'),
    lat: parseFloat(get('lat','latitude')) || undefined,
    lng: parseFloat(get('lng','lng','longitude')) || undefined,
    phone: get('phone','tel','telephone','téléphone'),
    email: get('email','mail','courriel'),
    website: get('website','site','url','site_web'),
    dog_policy: (get('dog_policy','politique_chien','animaux') as StagingListing['dog_policy']) || 'unknown',
    dog_policy_detail: get('dog_policy_detail','detail_policy','conditions'),
    dog_size_rule: get('dog_size_rule'),
    inside_allowed: get('inside_allowed') || 'unknown',
    terrace_only: get('terrace_only') || 'unknown',
    leash_required: get('leash_required') || 'unknown',
    extra_fee: get('extra_fee') || 'unknown',
    proof_excerpt: get('proof_excerpt','preuve','excerpt'),
    confidence_score: parseInt(get('confidence_score','confiance')) || 30,
    source_url: get('source_url','url_source'),
    source_domain: get('source_domain','domaine'),
    admin_notes: get('admin_notes','notes'),
    external_id: get('external_id','id_externe'),
  }
}
