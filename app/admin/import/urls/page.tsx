'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type AnalysisResult = {
  url: string; domain: string; page_type: string; compatibility: string;
  items_found: number; status: string; error_message?: string;
  items: { name: string; dog_policy: string; confidence_score: number; commune_name?: string; proof_excerpt?: string }[]
}

const COMPAT_COLOR: Record<string, string> = {
  excellent: '#16a34a', good: '#2563eb', medium: '#d97706', low: '#f97316', failed: '#dc2626'
}

export default function ImportUrlsPage() {
  const router = useRouter()
  const [urlText, setUrlText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<AnalysisResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imported, setImported] = useState<{ batch_id: string; total_imported: number } | null>(null)

  const urls = urlText.split('\n').map(u => u.trim()).filter(Boolean)

  const handleAnalyze = async () => {
    setError(null); setResults(null); setImported(null)
    if (!urls.length) { setError('Entrez au moins une URL'); return }
    setAnalyzing(true)
    try {
      const res = await fetch('/api/admin/import/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults(data.results)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleImport = async () => {
    setImporting(true); setError(null)
    try {
      const res = await fetch('/api/admin/import/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, label: `URLs — ${new Date().toLocaleDateString('fr-FR')}` }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setImported(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setImporting(false)
    }
  }

  if (imported) {
    return (
      <div className="max-w-xl">
        <div className="card p-6 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-basalte)' }}>
            {imported.total_imported} fiche(s) importée(s) en staging
          </h2>
          <p className="text-sm text-gray-500 mb-4">Elles sont disponibles dans la zone de staging pour revue.</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push(`/admin/staging?batch_id=${imported.batch_id}`)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'var(--color-vert)' }}
            >
              Voir en staging
            </button>
            <button onClick={() => { setResults(null); setImported(null); setUrlText('') }}
              className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: '#e2e8f0' }}>
              Nouvel import
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/import" className="text-sm text-gray-400 hover:underline">← Import</a>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
          Import par URLs
        </h1>
      </div>

      <div className="card p-5 mb-5 max-w-2xl">
        <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-basalte)' }}>
          URLs à analyser <span className="text-gray-400 font-normal">(une par ligne, max 20)</span>
        </label>
        <textarea
          value={urlText}
          onChange={e => setUrlText(e.target.value)}
          rows={6}
          placeholder="https://www.reunion.fr/...&#10;https://www.irt.re/..."
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2"
          style={{ borderColor: '#e2e8f0' }}
        />
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !urls.length}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'var(--color-basalte)' }}
          >
            {analyzing ? 'Analyse en cours…' : `Analyser ${urls.length || ''} URL${urls.length > 1 ? 's' : ''}`}
          </button>
          <span className="text-xs text-gray-400">{urls.length} URL{urls.length > 1 ? 's' : ''} détectée{urls.length > 1 ? 's' : ''}</span>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {results && (
        <div>
          {/* Summary */}
          <div className="flex gap-4 mb-4 text-sm">
            <span className="text-gray-500">{results.length} source(s) analysée(s)</span>
            <span className="text-green-600">{results.reduce((acc, r) => acc + r.items_found, 0)} lieu(x) détecté(s)</span>
          </div>

          {/* Results table */}
          <div className="card overflow-x-auto mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: '#e2e8f0' }}>
                  {['URL','Type page','Compatibilité','Lieux','Statut'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.url} className="border-b" style={{ borderColor: '#f1f5f9' }}>
                    <td className="py-2 px-3 font-mono text-xs max-w-xs truncate text-gray-600">{r.url}</td>
                    <td className="py-2 px-3 text-gray-500">{r.page_type}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ background: COMPAT_COLOR[r.compatibility] ?? '#6b7280' }}>
                        {r.compatibility}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold" style={{ color: 'var(--color-basalte)' }}>{r.items_found}</td>
                    <td className="py-2 px-3 text-xs text-gray-500">{r.error_message ?? r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Preview items */}
          {results.flatMap(r => r.items).length > 0 && (
            <div className="mb-5">
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--color-basalte)' }}>
                Aperçu des données extraites
              </h2>
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#e2e8f0' }}>
                      {['Nom','Commune','Policy chien','Confiance','Preuve'].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.flatMap(r => r.items).map((item, idx) => (
                      <tr key={idx} className="border-b" style={{ borderColor: '#f1f5f9' }}>
                        <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-basalte)' }}>{item.name}</td>
                        <td className="py-2 px-3 text-gray-500">{item.commune_name ?? '—'}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            item.dog_policy === 'yes' ? 'bg-green-100 text-green-700' :
                            item.dog_policy === 'no' ? 'bg-red-100 text-red-700' :
                            item.dog_policy === 'conditional' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>{item.dog_policy}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`text-xs font-semibold ${item.confidence_score >= 70 ? 'text-green-600' : item.confidence_score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                            {item.confidence_score}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-gray-400 max-w-xs truncate">{item.proof_excerpt ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={importing || results.flatMap(r => r.items).length === 0}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--color-vert)' }}
            >
              {importing ? 'Import en cours…' : 'Importer en staging'}
            </button>
            <button onClick={() => setResults(null)}
              className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: '#e2e8f0', color: '#374151' }}>
              Modifier les URLs
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
