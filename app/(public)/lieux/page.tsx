import type { Metadata } from 'next'
import { getPublishedListings, getAllCommunes, getCategoriesByType } from '@/lib/db/queries'
import { ListingCard } from '@/components/listings/ListingCard'
import { AdSlot } from '@/components/sponsor/AdSlot'
import Link from 'next/link'
import type { DogPolicyStatus } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Lieux dog-friendly à La Réunion',
  description: 'Restaurants, plages, hébergements, commerces — tous les lieux qui acceptent ton animal à La Réunion.',
}

interface PageProps {
  searchParams: Promise<{ q?: string; commune_slug?: string; dog_policy?: string; category?: string; page?: string }>
}

export default async function LieuxPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))

  let result = { items: [] as Awaited<ReturnType<typeof getPublishedListings>>['items'], total: 0, page: 1, per_page: 24 }
  let communes: Awaited<ReturnType<typeof getAllCommunes>> = []
  let categories: Awaited<ReturnType<typeof getCategoriesByType>> = []

  try {
    ;[result, communes, categories] = await Promise.all([
      getPublishedListings({
        listing_type: 'place',
        q: sp.q,
        commune_slug: sp.commune_slug,
        dog_policy: (sp.dog_policy || undefined) as DogPolicyStatus | undefined,
        category_slug: sp.category,
        page,
        per_page: 24,
      }),
      getAllCommunes(),
      getCategoriesByType('place'),
    ])
  } catch { /* DB not ready */ }

  const totalPages = Math.ceil(result.total / result.per_page)

  return (
    <div className="section" style={{ background: 'var(--color-sable)' }}>
      <div className="container">
        <div className="mb-6">
          <h1 className="text-h1 mb-1" style={{ color: 'var(--color-basalte)' }}>
            Lieux dog-friendly
          </h1>
          <p className="text-body" style={{ color: 'var(--color-muted)' }}>
            {result.total} lieu{result.total > 1 ? 'x' : ''} trouvé{result.total > 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters */}
        <form method="GET" className="flex flex-wrap gap-2 mb-6">
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Rechercher un lieu…"
            className="border rounded-xl px-4 py-2 text-sm flex-1 min-w-40 focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--color-border)', background: '#fff' }}
          />
          <select
            name="commune_slug"
            defaultValue={sp.commune_slug ?? ''}
            className="border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <option value="">Toute l&apos;île</option>
            {communes.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <select
            name="dog_policy"
            defaultValue={sp.dog_policy ?? ''}
            className="border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <option value="">Tous statuts</option>
            <option value="allowed">Accepté</option>
            <option value="conditional">Sous conditions</option>
            <option value="unknown">À confirmer</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--color-vert)' }}
          >
            Filtrer
          </button>
        </form>

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href="/lieux"
              className="px-3 py-1 rounded-full text-sm font-medium border transition-all"
              style={{
                borderColor: !sp.category ? 'var(--color-vert)' : 'var(--color-border)',
                background: !sp.category ? 'var(--color-vert-light)' : '#fff',
                color: !sp.category ? 'var(--color-vert)' : 'var(--color-muted)',
              }}
            >
              Tous
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/lieux?category=${cat.slug}`}
                className="px-3 py-1 rounded-full text-sm font-medium border transition-all"
                style={{
                  borderColor: sp.category === cat.slug ? 'var(--color-vert)' : 'var(--color-border)',
                  background: sp.category === cat.slug ? 'var(--color-vert-light)' : '#fff',
                  color: sp.category === cat.slug ? 'var(--color-vert)' : 'var(--color-muted)',
                }}
              >
                {cat.icon} {cat.label}
              </Link>
            ))}
          </div>
        )}

        {/* Ad slot */}
        <AdSlot slotKey="listing_inline_3" className="mb-6" />

        {/* Grid */}
        {result.items.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-subtle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </div>
            <p className="text-body" style={{ color: 'var(--color-muted)' }}>
              Aucun lieu trouvé.{' '}
              <Link href="/contribuer" style={{ color: 'var(--color-corail)' }}>
                Proposer un lieu ?
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {result.items.map((listing, idx) => (
              <>
                <ListingCard key={listing.id} listing={listing} />
                {idx === 7 && <AdSlot key="ad-8" slotKey="listing_inline_8" className="sm:col-span-2 lg:col-span-1" />}
              </>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams()
              if (sp.q) params.set('q', sp.q)
              if (sp.commune_slug) params.set('commune_slug', sp.commune_slug)
              if (sp.dog_policy) params.set('dog_policy', sp.dog_policy)
              if (sp.category) params.set('category', sp.category)
              params.set('page', String(p))
              return (
                <a
                  key={p}
                  href={`/lieux?${params}`}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium"
                  style={{
                    background: p === page ? 'var(--color-vert)' : '#fff',
                    color: p === page ? '#fff' : 'var(--color-muted)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {p}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
