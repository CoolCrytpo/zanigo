import type { Metadata } from 'next'
import { getPublishedListings, getAllCommunes } from '@/lib/db/queries'
import { ListingCard } from '@/components/listings/ListingCard'
import Link from 'next/link'
import type { DogPolicyStatus } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Spots dog-friendly à La Réunion',
  description: 'Points de vue, parcs, spots nature — les meilleurs spots pour sortir avec ton animal à La Réunion.',
}

interface PageProps {
  searchParams: Promise<{ q?: string; commune_slug?: string; dog_policy?: string; page?: string }>
}

export default async function SpotsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))

  let result = { items: [] as Awaited<ReturnType<typeof getPublishedListings>>['items'], total: 0, page: 1, per_page: 24 }
  let communes: Awaited<ReturnType<typeof getAllCommunes>> = []

  try {
    ;[result, communes] = await Promise.all([
      getPublishedListings({
        listing_type: 'spot',
        q: sp.q,
        commune_slug: sp.commune_slug,
        dog_policy: (sp.dog_policy || undefined) as DogPolicyStatus | undefined,
        page,
        per_page: 24,
      }),
      getAllCommunes(),
    ])
  } catch { /* DB not ready */ }

  const totalPages = Math.ceil(result.total / result.per_page)

  return (
    <div className="section" style={{ background: 'var(--color-sable)' }}>
      <div className="container">
        <div className="mb-6">
          <h1 className="text-h1 mb-1" style={{ color: 'var(--color-basalte)' }}>Spots</h1>
          <p className="text-body" style={{ color: 'var(--color-muted)' }}>
            {result.total} spot{result.total > 1 ? 's' : ''} trouvé{result.total > 1 ? 's' : ''}
          </p>
        </div>

        <form method="GET" className="flex flex-wrap gap-2 mb-6">
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Rechercher un spot…"
            className="border rounded-xl px-4 py-2 text-sm flex-1 min-w-40 focus:outline-none"
            style={{ borderColor: 'var(--color-border)', background: '#fff' }}
          />
          <select
            name="commune_slug"
            defaultValue={sp.commune_slug ?? ''}
            className="border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <option value="">Toute l&apos;île</option>
            {communes.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--color-vert)' }}
          >
            Filtrer
          </button>
        </form>

        {result.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">📍</p>
            <p className="text-body" style={{ color: 'var(--color-muted)' }}>
              Aucun spot trouvé.{' '}
              <Link href="/contribuer" style={{ color: 'var(--color-corail)' }}>
                Proposer un spot ?
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {result.items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams()
              if (sp.q) params.set('q', sp.q)
              if (sp.commune_slug) params.set('commune_slug', sp.commune_slug)
              params.set('page', String(p))
              return (
                <a
                  key={p}
                  href={`/spots?${params}`}
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
