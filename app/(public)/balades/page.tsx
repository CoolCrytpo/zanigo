'use client'

import { useState, useEffect, useCallback } from 'react'
import { Map } from 'lucide-react'
import { ListingCard } from '@/components/listings/ListingCard'
import { TRAIL_DIFFICULTY_LABELS, TRAIL_DIFFICULTY_COLORS } from '@/config/constants'
import Link from 'next/link'
import type { Listing, Commune, TrailDifficulty } from '@/lib/types'

const DIFFICULTIES: { value: TrailDifficulty; label: string }[] = [
  { value: 'easy',     label: 'Facile' },
  { value: 'moderate', label: 'Modéré' },
  { value: 'hard',     label: 'Difficile' },
  { value: 'expert',   label: 'Expert' },
]

export default function BaladesPage() {
  const [q, setQ] = useState('')
  const [difficulty, setDifficulty] = useState<TrailDifficulty | ''>('')
  const [communeSlug, setCommuneSlug] = useState('')
  const [page, setPage] = useState(1)

  const [items, setItems] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [communes, setCommunes] = useState<Commune[]>([])
  const [loading, setLoading] = useState(true)

  const perPage = 24

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (difficulty) params.set('difficulty', difficulty)
    if (communeSlug) params.set('commune_slug', communeSlug)
    params.set('page', String(page))
    try {
      const res = await fetch(`/api/listings?type=walk&${params}`)
      const data = await res.json()
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
      if (data.communes) setCommunes(data.communes)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [q, difficulty, communeSlug, page])

  useEffect(() => { void fetch_() }, [fetch_])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="section" style={{ background: 'var(--color-sable)' }}>
      <div className="container">
        <div className="mb-6">
          <h1 className="text-h1 mb-1" style={{ color: 'var(--color-basalte)' }}>Balades</h1>
          <p className="text-body" style={{ color: 'var(--color-muted)' }}>
            {total} balade{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
            placeholder="Rechercher une balade…"
            className="border rounded-xl px-4 py-2 text-sm flex-1 min-w-40 focus:outline-none"
            style={{ borderColor: 'var(--color-border)', background: '#fff' }}
          />
          <select
            value={communeSlug}
            onChange={(e) => { setCommuneSlug(e.target.value); setPage(1) }}
            className="border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <option value="">Toute l&apos;île</option>
            {communes.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        {/* Difficulty chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setDifficulty(''); setPage(1) }}
            className="px-3 py-1 rounded-full text-sm font-medium border transition-all"
            style={{
              borderColor: difficulty === '' ? 'var(--color-vert)' : 'var(--color-border)',
              background: difficulty === '' ? 'var(--color-vert-light)' : '#fff',
              color: difficulty === '' ? 'var(--color-vert)' : 'var(--color-muted)',
            }}
          >
            Toutes
          </button>
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => { setDifficulty(d.value); setPage(1) }}
              className="px-3 py-1 rounded-full text-sm font-medium border transition-all"
              style={{
                borderColor: difficulty === d.value ? TRAIL_DIFFICULTY_COLORS[d.value] : 'var(--color-border)',
                background: difficulty === d.value ? `${TRAIL_DIFFICULTY_COLORS[d.value]}15` : '#fff',
                color: difficulty === d.value ? TRAIL_DIFFICULTY_COLORS[d.value] : 'var(--color-muted)',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-52 animate-pulse" style={{ background: '#e5e7eb' }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-3">
              <Map size={40} style={{ color: 'var(--color-subtle)' }} />
            </div>
            <p className="text-body" style={{ color: 'var(--color-muted)' }}>
              Aucune balade trouvée.{' '}
              <Link href="/contribuer" style={{ color: 'var(--color-corail)' }}>
                Proposer une balade ?
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium"
                style={{
                  background: p === page ? 'var(--color-vert)' : '#fff',
                  color: p === page ? '#fff' : 'var(--color-muted)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
