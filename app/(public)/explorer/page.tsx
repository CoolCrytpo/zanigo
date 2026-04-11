'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ListingCard } from '@/components/listings/ListingCard'
import type { Listing, Commune, ListingType, DogPolicyStatus } from '@/lib/types'

const TYPES: { value: ListingType | ''; label: string; icon: string }[] = [
  { value: '',        label: 'Tout',     icon: '🔍' },
  { value: 'place',   label: 'Lieux',    icon: '🏠' },
  { value: 'spot',    label: 'Spots',    icon: '📍' },
  { value: 'walk',    label: 'Balades',  icon: '🥾' },
  { value: 'service', label: 'Services', icon: '🐾' },
]

const DOG_POLICIES: { value: DogPolicyStatus | ''; label: string }[] = [
  { value: '',            label: 'Tous statuts' },
  { value: 'allowed',     label: '✅ Accepté' },
  { value: 'conditional', label: '⚠️ Conditions' },
  { value: 'unknown',     label: '❓ À confirmer' },
]

export default function ExplorerPage() {
  const [q, setQ] = useState('')
  const [type, setType] = useState<ListingType | ''>('')
  const [dogPolicy, setDogPolicy] = useState<DogPolicyStatus | ''>('')
  const [communeSlug, setCommuneSlug] = useState('')
  const [page, setPage] = useState(1)

  const [items, setItems] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [communes, setCommunes] = useState<Commune[]>([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const searchRef = useRef<HTMLInputElement>(null)
  const perPage = 24

  const doSearch = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (type) params.set('type', type)
    if (dogPolicy) params.set('dog_policy', dogPolicy)
    if (communeSlug) params.set('commune_slug', communeSlug)
    params.set('page', String(page))
    try {
      const res = await fetch(`/api/search?${params}`)
      const data = await res.json()
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
      if (data.communes?.length) setCommunes(data.communes)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [q, type, dogPolicy, communeSlug, page])

  useEffect(() => { void doSearch() }, [doSearch])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div style={{ background: 'var(--color-sable)', minHeight: '100dvh' }}>
      {/* Search header */}
      <div
        className="sticky top-14 z-40 border-b"
        style={{ background: 'rgba(245,241,232,0.97)', borderColor: 'var(--color-border)', backdropFilter: 'blur(12px)' }}
      >
        <div className="container py-3">
          {/* Search input */}
          <div className="relative mb-3">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
              width="16" height="16" fill="none" viewBox="0 0 16 16"
            >
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1) }}
              placeholder="Plage, restaurant, balade, vétérinaire…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)', background: '#fff' }}
            />
          </div>

          {/* Type chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setType(t.value); setPage(1) }}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                style={{
                  borderColor: type === t.value ? 'var(--color-vert)' : 'var(--color-border)',
                  background: type === t.value ? 'var(--color-vert-light)' : '#fff',
                  color: type === t.value ? 'var(--color-vert)' : 'var(--color-muted)',
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}

            <div className="flex-shrink-0 w-px mx-1" style={{ background: 'var(--color-border)' }} />

            <select
              value={dogPolicy}
              onChange={(e) => { setDogPolicy(e.target.value as DogPolicyStatus | ''); setPage(1) }}
              className="flex-shrink-0 border rounded-full px-3 py-1.5 text-sm bg-white focus:outline-none"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {DOG_POLICIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>

            <select
              value={communeSlug}
              onChange={(e) => { setCommuneSlug(e.target.value); setPage(1) }}
              className="flex-shrink-0 border rounded-full px-3 py-1.5 text-sm bg-white focus:outline-none"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="">Toute l&apos;île</option>
              {communes.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container py-6">
        {initialized && (
          <p className="text-caption mb-4">
            {loading ? 'Recherche…' : `${total} résultat${total > 1 ? 's' : ''}`}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-52 animate-pulse" style={{ background: '#e5e7eb' }} />
            ))}
          </div>
        ) : items.length === 0 && initialized ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">🐾</p>
            <p className="text-body" style={{ color: 'var(--color-muted)' }}>
              Aucun résultat pour cette recherche.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

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
