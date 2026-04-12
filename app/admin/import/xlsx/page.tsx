'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Link2, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'

type PreviewRow = Record<string, string>

const SCHEMA_COLUMNS = ['name', 'address', 'commune', 'type', 'dog_policy', 'website', 'phone', 'email', 'category', 'description']

export default function ImportXlsxPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<'file' | 'gsheet'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [gsheetUrl, setGsheetUrl] = useState('')
  const [label, setLabel] = useState('')

  // Preview state
  const [headers, setHeaders] = useState<string[]>([])
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({}) // schemaCol → sourceCol

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ batch_id: string; imported: number; rejected: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Parse XLSX client-side for preview
  const parseXlsx = async (f: File) => {
    const { read, utils } = await import('xlsx')
    const buf = await f.arrayBuffer()
    const wb = read(buf)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows: string[][] = utils.sheet_to_json(ws, { header: 1 })
    if (rows.length < 2) { setError('Fichier vide ou sans données.'); return }
    const h = (rows[0] as string[]).map(String)
    const data = rows.slice(1, 6).map(r =>
      Object.fromEntries(h.map((col, i) => [col, String((r as string[])[i] ?? '')]))
    )
    setHeaders(h)
    setPreview(data)
    // Auto-map obvious columns
    const auto: Record<string, string> = {}
    SCHEMA_COLUMNS.forEach(sc => {
      const match = h.find(h => h.toLowerCase().replace(/[\s_-]/g, '') === sc.replace(/[\s_-]/g, ''))
      if (match) auto[sc] = match
    })
    setMapping(auto)
  }

  const parseGSheet = async () => {
    // Convert Google Sheet URL to CSV export URL
    const match = gsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
    if (!match) { setError('URL Google Sheet invalide.'); return }
    const sheetId = match[1]
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
    try {
      const res = await fetch(`/api/admin/import/gsheet-preview?url=${encodeURIComponent(csvUrl)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setHeaders(data.headers)
      setPreview(data.preview)
      const auto: Record<string, string> = {}
      SCHEMA_COLUMNS.forEach(sc => {
        const match = data.headers.find((h: string) => h.toLowerCase().replace(/[\s_-]/g, '') === sc.replace(/[\s_-]/g, ''))
        if (match) auto[sc] = match
      })
      setMapping(auto)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de connexion au Google Sheet.')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setLabel(f.name.replace(/\.[^.]+$/, ''))
    setError(null)
    await parseXlsx(f)
  }

  const handleImport = async () => {
    setLoading(true); setError(null)
    try {
      // Re-parse full file with mapping applied, send as CSV-like JSON
      let rows: PreviewRow[] = []
      if (mode === 'file' && file) {
        const { read, utils } = await import('xlsx')
        const buf = await file.arrayBuffer()
        const wb = read(buf)
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw: string[][] = utils.sheet_to_json(ws, { header: 1 })
        const h = (raw[0] as string[]).map(String)
        rows = raw.slice(1).map(r =>
          Object.fromEntries(h.map((col, i) => [col, String((r as string[])[i] ?? '')]))
        )
      } else if (mode === 'gsheet' && gsheetUrl) {
        const match = gsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
        if (!match) throw new Error('URL invalide')
        const csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`
        const res = await fetch(`/api/admin/import/gsheet-preview?url=${encodeURIComponent(csvUrl)}&full=true`)
        const data = await res.json()
        rows = data.rows
      }

      // Apply mapping: transform source columns to schema columns
      const mapped = rows.map(row => {
        const out: Record<string, string> = {}
        SCHEMA_COLUMNS.forEach(sc => {
          const src = mapping[sc]
          if (src && row[src] !== undefined) out[sc] = row[src]
        })
        return out
      }).filter(r => r.name?.trim())

      const res = await fetch('/api/admin/import/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: mapped, label: label || 'XLSX import', source_type: 'manual_csv' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur import')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="max-w-lg">
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} style={{ color: '#16a34a' }} />
            <h2 className="font-bold text-lg" style={{ color: '#111827' }}>Import terminé</h2>
          </div>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            <strong>{result.imported}</strong> lieux importés en staging.
            {result.rejected > 0 && <> <strong>{result.rejected}</strong> ignorés (données manquantes).</>}
          </p>
          <button onClick={() => router.push(`/admin/staging?batch_id=${result.batch_id}`)}
            className="flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-sm text-white"
            style={{ background: '#2563eb' }}>
            Voir le staging <ArrowRight size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold mb-5" style={{ color: '#111827' }}>Import XLS / Google Sheet</h1>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'file', label: 'Fichier XLS/XLSX', icon: Upload },
          { key: 'gsheet', label: 'Google Sheet', icon: Link2 },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => { setMode(key as 'file' | 'gsheet'); setHeaders([]); setPreview([]) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
            style={{
              background: mode === key ? '#2563eb' : '#fff',
              color: mode === key ? '#fff' : '#374151',
              borderColor: mode === key ? '#2563eb' : '#e2e8f0',
            }}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="card p-5 mb-4">
        <div className="mb-3">
          <label className="text-xs font-semibold block mb-1 uppercase tracking-wide" style={{ color: '#6b7280' }}>
            Label de l&apos;import
          </label>
          <input value={label} onChange={e => setLabel(e.target.value)}
            placeholder="Ex: Restaurants Saint-Denis 2026"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ borderColor: '#e2e8f0' }} />
        </div>

        {mode === 'file' ? (
          <div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.ods,.csv" onChange={handleFileChange} className="hidden" />
            <button onClick={() => fileRef.current?.click()}
              className="w-full py-6 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all"
              style={{ borderColor: '#e2e8f0', color: '#9ca3af' }}>
              <Upload size={22} strokeWidth={1.5} />
              <span className="text-sm font-medium">{file ? file.name : 'Sélectionner un fichier XLS, XLSX ou CSV'}</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input value={gsheetUrl} onChange={e => setGsheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: '#e2e8f0' }} />
            <button onClick={parseGSheet}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: '#374151' }}>
              Charger
            </button>
          </div>
        )}
      </div>

      {/* Preview + mapping */}
      {headers.length > 0 && (
        <div className="card p-5 mb-4">
          <h2 className="font-semibold mb-3 text-sm" style={{ color: '#111827' }}>
            Correspondance des colonnes
          </h2>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {SCHEMA_COLUMNS.map(sc => (
              <div key={sc} className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: '#f1f5f9', color: '#374151', minWidth: '100px' }}>
                  {sc}
                </span>
                <ArrowRight size={12} style={{ color: '#9ca3af', flexShrink: 0 }} />
                <select value={mapping[sc] ?? ''}
                  onChange={e => setMapping(m => ({ ...m, [sc]: e.target.value }))}
                  className="flex-1 border rounded px-2 py-1 text-xs focus:outline-none"
                  style={{ borderColor: '#e2e8f0' }}>
                  <option value="">— ignorer —</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>

          <h2 className="font-semibold mb-2 text-sm" style={{ color: '#111827' }}>
            Aperçu (5 premières lignes)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  {headers.map(h => (
                    <th key={h} className="px-2 py-1 text-left font-semibold whitespace-nowrap"
                      style={{ background: '#f8fafc', color: '#6b7280', borderBottom: '1px solid #e2e8f0' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {headers.map(h => (
                      <td key={h} className="px-2 py-1 truncate max-w-32" style={{ color: '#374151' }}>
                        {row[h] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {headers.length > 0 && (
        <button onClick={handleImport} disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: '#2563eb' }}>
          {loading ? 'Import en cours…' : <>Importer vers le staging <ArrowRight size={14} /></>}
        </button>
      )}
    </div>
  )
}
