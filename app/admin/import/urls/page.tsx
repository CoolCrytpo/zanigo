'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type AnalysisResult = {
  url: string; domain: string; page_type: string; compatibility: string;
  items_found: number; status: string; error_message?: string;
  items: { name: string; dog_policy: string; confidence_score: number; commune_name?: string; proof_excerpt?: string }[]
}

type QuickRow = {
  id: number
  name: string
  category: string
  commune: string
  phone: string
  website: string
  dog_policy: 'unknown' | 'yes' | 'no' | 'conditional'
}

const COMPAT_COLOR: Record<string, string> = {
  excellent: '#16a34a', good: '#2563eb', medium: '#d97706', low: '#f97316', failed: '#dc2626'
}

const COMMUNES = [
  'Saint-Denis', 'Saint-Paul', 'Saint-Pierre', 'Le Tampon', 'Saint-Louis', 'Saint-André',
  'Saint-Benoît', 'Saint-Joseph', 'Sainte-Marie', 'Sainte-Rose', 'Saint-Leu', 'Cilaos',
  'Entre-Deux', "L'Étang-Salé", 'Petite-Île', 'Les Avirons', 'Saint-Philippe',
  'Sainte-Suzanne', 'Bras-Panon', 'La Plaine-des-Palmistes', 'La Possession',
  'Le Port', 'Trois-Bassins', 'Salazie',
]

const CATEGORIES = [
  'restaurant', 'hotel', 'camping', 'gite', 'chambre_hote',
  'commerce', 'attraction', 'plage', 'activite', 'autre',
]

const DOMAIN_HINTS: Record<string, { why: string; tip: string }> = {
  tripadvisor: {
    why: 'TripAdvisor bloque les requêtes automatiques (anti-bot + JS).',
    tip: 'Utilisez TripAdvisor comme référence visuelle et saisissez les établissements ci-dessous.',
  },
  'booking.com': {
    why: 'Booking.com est protégé contre le scraping.',
    tip: "Saisissez les établissements manuellement avec l'URL Booking comme référence.",
  },
  'reunion.fr': {
    why: 'reunion.fr charge les hôtels en JavaScript — inaccessible en extraction statique.',
    tip: 'Téléchargez le CSV depuis l\'OTI ou saisissez manuellement.',
  },
  'facebook.com': {
    why: 'Facebook bloque les accès non authentifiés.',
    tip: 'Saisissez les infos manuellement.',
  },
}

function getDomainHint(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return Object.entries(DOMAIN_HINTS).find(([k]) => host.includes(k))?.[1] ?? null
  } catch { return null }
}

let nextId = 1
function newRow(): QuickRow {
  return { id: nextId++, name: '', category: '', commune: '', phone: '', website: '', dog_policy: 'unknown' }
}

export default function ImportUrlsPage() {
  const router = useRouter()
  const [urlText, setUrlText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<AnalysisResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imported, setImported] = useState<{ batch_id: string; total_imported?: number; imported?: number } | null>(null)
  const [quickMode, setQuickMode] = useState(false)
  const [quickRows, setQuickRows] = useState<QuickRow[]>([newRow()])

  const urls = urlText.split('\n').map(u => u.trim()).filter(Boolean)
  const totalItems = results ? results.reduce((acc, r) => acc + r.items_found, 0) : 0

  const handleAnalyze = async () => {
    setError(null); setResults(null); setImported(null); setQuickMode(false)
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

  const handleQuickImport = async () => {
    setImporting(true); setError(null)
    const validRows = quickRows.filter(r => r.name.trim())
    if (!validRows.length) { setError('Ajoutez au moins un lieu'); setImporting(false); return }
    try {
      const res = await fetch('/api/admin/import/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: validRows.map(r => ({
            name: r.name, category: r.category || undefined,
            commune: r.commune || undefined, phone: r.phone || undefined,
            website: r.website || undefined, dog_policy: r.dog_policy,
          })),
          label: `Saisie manuelle — ${new Date().toLocaleDateString('fr-FR')}`,
          source_url: urls[0] || undefined,
        }),
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

  const updateRow = (id: number, field: keyof QuickRow, value: string) => {
    setQuickRows(rows => rows.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const addRow = () => setQuickRows(rows => [...rows, newRow()])
  const removeRow = (id: number) => setQuickRows(rows => rows.length > 1 ? rows.filter(r => r.id !== id) : rows)

  if (imported) {
    const count = imported.total_imported ?? imported.imported ?? 0
    return (
      <div className="max-w-xl">
        <div className="card p-6 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-basalte)' }}>
            {count} fiche(s) importée(s) en staging
          </h2>
          <p className="text-sm text-gray-500 mb-4">Disponibles dans la zone de staging pour revue.</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push(`/admin/staging?batch_id=${imported.batch_id}`)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'var(--color-vert)' }}
            >
              Voir en staging
            </button>
            <button onClick={() => { setResults(null); setImported(null); setUrlText(''); setQuickMode(false); setQuickRows([newRow()]) }}
              className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: '#e2e8f0' }}>
              Nouvel import
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hint = urls.length > 0 ? getDomainHint(urls[0]) : null

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/import" className="text-sm text-gray-400 hover:underline">← Import</a>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
          Import par URLs
        </h1>
      </div>

      <div className="card p-4 mb-5 max-w-2xl" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: '#15803d' }}>💡 Méthode recommandée en 2 phases</p>
        <p className="text-sm text-gray-600">
          <strong>Phase 1 :</strong> importer les établissements avec leurs infos de base (nom, adresse, tel, commune).
          La politique animaux reste <em>inconnue</em> — c'est normal et attendu.
        </p>
        <p className="text-sm text-gray-600 mt-1">
          <strong>Phase 2 :</strong> enrichir la politique chien au fil du temps — par l'admin, les pros, ou les contributeurs.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          ⚠️ Les sites JS-dynamiques (reunion.fr, TripAdvisor…) ne sont pas extractibles par URL — utiliser le CSV à la place.
        </p>
      </div>

      {!quickMode && (
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
      )}

      {/* Fallback panel — 0 results */}
      {results && totalItems === 0 && !quickMode && (
        <div className="card p-5 mb-5 max-w-2xl" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: '#c2410c' }}>Aucune donnée extraite</p>
          {hint ? (
            <>
              <p className="text-sm text-gray-700 mb-1"><strong>Pourquoi :</strong> {hint.why}</p>
              <p className="text-sm text-gray-700 mb-3"><strong>Solution :</strong> {hint.tip}</p>
            </>
          ) : (
            <p className="text-sm text-gray-600 mb-3">Le site n'a retourné aucun établissement exploitable. Vous pouvez saisir les lieux manuellement.</p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setQuickMode(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'var(--color-basalte)' }}
            >
              Saisir manuellement
            </button>
            <a
              href="/api/admin/import/batch/template"
              className="px-4 py-2 rounded-lg text-sm border font-medium"
              style={{ borderColor: '#e2e8f0', color: '#374151' }}
            >
              Template CSV
            </a>
            <a
              href="/admin/import/csv"
              className="px-4 py-2 rounded-lg text-sm border font-medium"
              style={{ borderColor: '#e2e8f0', color: '#374151' }}
            >
              Import CSV
            </a>
          </div>
        </div>
      )}

      {/* Partial success hint */}
      {results && totalItems > 0 && totalItems < 3 && !quickMode && (
        <div className="card p-4 mb-4 max-w-2xl" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
          <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
            Données incomplètes ({totalItems} lieu{totalItems > 1 ? 'x' : ''} détecté{totalItems > 1 ? 's' : ''}) — enrichissez manuellement
          </p>
          <button
            onClick={() => setQuickMode(true)}
            className="mt-2 text-sm underline"
            style={{ color: 'var(--color-basalte)' }}
          >
            Ouvrir la saisie rapide
          </button>
        </div>
      )}

      {/* Normal results */}
      {results && totalItems > 0 && !quickMode && (
        <div>
          <div className="flex gap-4 mb-4 text-sm">
            <span className="text-gray-500">{results.length} source(s) analysée(s)</span>
            <span className="text-green-600">{totalItems} lieu(x) détecté(s)</span>
          </div>

          <div className="card overflow-x-auto mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: '#e2e8f0' }}>
                  {['URL', 'Type page', 'Compatibilité', 'Lieux', 'Statut'].map(h => (
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

          {results.flatMap(r => r.items).length > 0 && (
            <div className="mb-5">
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--color-basalte)' }}>
                Aperçu des données extraites
              </h2>
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#e2e8f0' }}>
                      {['Nom', 'Commune', 'Policy chien', 'Confiance', 'Preuve'].map(h => (
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
              disabled={importing || totalItems === 0}
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

      {/* Quick entry form */}
      {quickMode && (
        <div className="max-w-5xl">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-basalte)' }}>Saisie rapide</h2>
            {urls[0] && (
              <span className="text-xs text-gray-400 font-mono truncate max-w-xs">Source : {urls[0]}</span>
            )}
            <button
              onClick={() => setQuickMode(false)}
              className="ml-auto text-sm text-gray-400 hover:underline"
            >
              ← Retour
            </button>
          </div>

          <div className="card overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: '#e2e8f0' }}>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400">Nom *</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400">Catégorie</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400">Commune</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400">Téléphone</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400">Site web</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400">Policy chien</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {quickRows.map(row => (
                  <tr key={row.id} className="border-b" style={{ borderColor: '#f1f5f9' }}>
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={row.name}
                        onChange={e => updateRow(row.id, 'name', e.target.value)}
                        placeholder="Nom du lieu"
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1"
                        style={{ borderColor: '#e2e8f0', minWidth: 160 }}
                      />
                    </td>
                    <td className="py-1 px-2">
                      <select
                        value={row.category}
                        onChange={e => updateRow(row.id, 'category', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none"
                        style={{ borderColor: '#e2e8f0' }}
                      >
                        <option value="">—</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-2">
                      <select
                        value={row.commune}
                        onChange={e => updateRow(row.id, 'commune', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none"
                        style={{ borderColor: '#e2e8f0' }}
                      >
                        <option value="">—</option>
                        {COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={row.phone}
                        onChange={e => updateRow(row.id, 'phone', e.target.value)}
                        placeholder="0262 …"
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none"
                        style={{ borderColor: '#e2e8f0', minWidth: 110 }}
                      />
                    </td>
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={row.website}
                        onChange={e => updateRow(row.id, 'website', e.target.value)}
                        placeholder="https://…"
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none"
                        style={{ borderColor: '#e2e8f0', minWidth: 140 }}
                      />
                    </td>
                    <td className="py-1 px-2">
                      <select
                        value={row.dog_policy}
                        onChange={e => updateRow(row.id, 'dog_policy', e.target.value as QuickRow['dog_policy'])}
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none"
                        style={{ borderColor: '#e2e8f0' }}
                      >
                        <option value="unknown">inconnu</option>
                        <option value="yes">oui</option>
                        <option value="conditional">conditionnel</option>
                        <option value="no">non</option>
                      </select>
                    </td>
                    <td className="py-1 px-2">
                      <button
                        onClick={() => removeRow(row.id)}
                        className="text-gray-300 hover:text-red-500 text-lg leading-none"
                        title="Supprimer"
                      >✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-2 border-t" style={{ borderColor: '#e2e8f0' }}>
              <button
                onClick={addRow}
                className="text-sm font-medium px-3 py-1 rounded"
                style={{ color: 'var(--color-vert)' }}
              >
                + Ajouter une ligne
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleQuickImport}
              disabled={importing}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--color-vert)' }}
            >
              {importing ? 'Import en cours…' : 'Importer en staging'}
            </button>
            <button
              onClick={() => setQuickMode(false)}
              className="px-4 py-2 rounded-lg text-sm border"
              style={{ borderColor: '#e2e8f0', color: '#374151' }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
