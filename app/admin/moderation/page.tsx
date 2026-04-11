'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Contribution } from '@/lib/types'

const TYPE_LABEL: Record<string, string> = {
  new_listing: '+ Nouveau lieu',
  correction: '✏️ Correction',
  report: '🚩 Signalement',
}

const TYPE_COLOR: Record<string, string> = {
  new_listing: '#16a34a',
  correction: '#2563eb',
  report: '#dc2626',
}

export default function ModerationPage() {
  const [items, setItems] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/contributions')
      const data = await res.json()
      setItems(data.items ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function act(id: string, status: 'approved' | 'rejected') {
    setActing(id)
    try {
      await fetch(`/api/admin/contributions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setItems(prev => prev.filter(c => c.id !== id))
    } finally {
      setActing(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
          Modération{' '}
          <span className="text-sm font-normal text-gray-400">({items.length} en attente)</span>
        </h1>
        <button onClick={load} className="text-sm px-3 py-1.5 rounded-lg border" style={{ borderColor: '#e2e8f0', color: '#374151' }}>
          Rafraîchir
        </button>
      </div>

      {loading ? (
        <div className="card p-6 text-center text-sm text-gray-400">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="card p-8 text-center text-sm text-gray-400">
          Aucune contribution en attente. 🎉
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(c => (
            <div key={c.id} className="card p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded text-white"
                    style={{ background: TYPE_COLOR[c.type] ?? '#6b7280' }}>
                    {TYPE_LABEL[c.type] ?? c.type}
                  </span>
                  {c.listing_id && (
                    <span className="text-xs text-gray-400 font-mono">fiche #{c.listing_id.slice(0, 8)}</span>
                  )}
                  <span className="text-xs text-gray-400">
                    {c.submitter_anon ?? 'Anonyme'} · {new Date(c.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                    className="text-xs px-2 py-1 rounded border"
                    style={{ borderColor: '#e2e8f0', color: '#374151' }}
                  >
                    {expanded === c.id ? 'Réduire' : 'Voir'}
                  </button>
                  <button
                    disabled={acting === c.id}
                    onClick={() => act(c.id, 'rejected')}
                    className="text-xs px-3 py-1 rounded font-semibold text-white"
                    style={{ background: '#dc2626', opacity: acting === c.id ? 0.6 : 1 }}
                  >
                    Rejeter
                  </button>
                  <button
                    disabled={acting === c.id}
                    onClick={() => act(c.id, 'approved')}
                    className="text-xs px-3 py-1 rounded font-semibold text-white"
                    style={{ background: 'var(--color-vert)', opacity: acting === c.id ? 0.6 : 1 }}
                  >
                    Approuver
                  </button>
                </div>
              </div>

              {expanded === c.id && (
                <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600 overflow-auto max-h-64">
                  <pre>{JSON.stringify(c.data, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
