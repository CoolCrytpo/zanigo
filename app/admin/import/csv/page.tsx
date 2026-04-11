'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ImportCsvPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ batch_id: string; imported: number; rejected: number; parse_errors: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('Sélectionnez un fichier CSV'); return }
    setLoading(true); setError(null)
    try {
      const form = new FormData()
      form.append('csv', file)
      form.append('label', `CSV — ${file.name}`)
      const res = await fetch('/api/admin/import/batch', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="max-w-lg">
        <div className="card p-6 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-basalte)' }}>
            {result.imported} fiche(s) importée(s)
          </h2>
          {result.rejected > 0 && <p className="text-sm text-amber-600 mb-1">{result.rejected} ligne(s) ignorée(s)</p>}
          {result.parse_errors.length > 0 && (
            <div className="text-left mt-3 mb-3">
              <p className="text-xs font-semibold text-red-600 mb-1">Erreurs de parsing :</p>
              {result.parse_errors.map((e, i) => <p key={i} className="text-xs text-red-500">{e}</p>)}
            </div>
          )}
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={() => router.push(`/admin/staging?batch_id=${result.batch_id}`)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'var(--color-vert)' }}>
              Voir en staging
            </button>
            <button onClick={() => { setResult(null); setFile(null) }}
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
          Import CSV
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-5">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--color-basalte)' }}>Importer un fichier</h2>
          <div
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer mb-4"
            style={{ borderColor: file ? 'var(--color-vert)' : '#e2e8f0' }}
            onClick={() => fileRef.current?.click()}
          >
            {file ? (
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-vert)' }}>📄 {file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} Ko</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500">Cliquer pour sélectionner un fichier CSV</p>
                <p className="text-xs text-gray-400 mt-1">ou glisser-déposer</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'var(--color-vert)' }}
          >
            {loading ? 'Import en cours…' : 'Importer'}
          </button>
          <div className="mt-3 text-center">
            <a href="/api/admin/import/batch/template" className="text-xs text-gray-400 hover:underline">
              ⬇️ Télécharger le template CSV
            </a>
          </div>
        </form>

        {/* Instructions */}
        <div className="card p-5">
          <h2 className="font-semibold mb-3" style={{ color: 'var(--color-basalte)' }}>Format attendu</h2>
          <p className="text-sm text-gray-500 mb-3">Le CSV doit comporter au minimum ces colonnes :</p>
          <div className="flex flex-col gap-1">
            {['name','category','commune','dog_policy','source_url'].map(col => (
              <code key={col} className="text-xs bg-gray-50 px-2 py-1 rounded font-mono" style={{ color: 'var(--color-basalte)' }}>
                {col}
              </code>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Valeurs <code>dog_policy</code> : <code>yes</code>, <code>no</code>, <code>conditional</code>, <code>unknown</code>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Les colonnes optionnelles sont ignorées si absentes. L'encodage UTF-8 est requis.
          </p>
        </div>
      </div>
    </div>
  )
}
