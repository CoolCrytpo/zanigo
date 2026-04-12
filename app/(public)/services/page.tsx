import type { Metadata } from 'next'
import { SearchX } from 'lucide-react'
import { getPublishedListings, getAllCommunes, getCategoriesByType } from '@/lib/db/queries'
import { ListingCard } from '@/components/listings/ListingCard'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Services animaliers à La Réunion',
  description: 'Vétérinaires, toilettage, pension, éducateurs — tous les services pour ton animal à La Réunion.',
}

interface PageProps {
  searchParams: Promise<{ q?: string; commune_slug?: string; category?: string; page?: string }>
}

export default async function ServicesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))

  let result = { items: [] as Awaited<ReturnType<typeof getPublishedListings>>['items'], total: 0, page: 1, per_page: 24 }
  let communes: Awaited<ReturnType<typeof getAllCommunes>> = []
  let categories: Awaited<ReturnType<typeof getCategoriesByType>> = []

  try {
    ;[result, communes, categories] = await Promise.all([
      getPublishedListings({
        listing_type: 'service',
        q: sp.q,
        commune_slug: sp.commune_slug,
        category_slug: sp.category,
        page,
        per_page: 24,
      }),
      getAllCommunes(),
      getCategoriesByType('service'),
    ])
  } catch { /* DB not ready */ }

  const totalPages = Math.ceil(result.total / result.per_page)

  return (
    <div className="section" style={{ background: 'var(--color-sable)' }}>
      <div className="container">
        <div className="mb-6">
          <h1 className="text-h1 mb-1" style={{ color: 'var(--color-basalte)' }}>Services</h1>
          <p className="text-body" style={{ color: 'var(--color-muted)' }}>
            {result.total} service{result.total > 1 ? 's' : ''} trouvé{result.total > 1 ? 's' : ''}
          </p>
        </div>

        <form method="GET" className="flex flex-wrap gap-2 mb-4">
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Rechercher un service…"
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

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href="/services"
              className="px-3 py-1 rounded-full text-sm font-medium border"
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
                href={`/services?category=${cat.slug}`}
                className="px-3 py-1 rounded-full text-sm font-medium border"
                style={{
                  borderColor: sp.category === cat.slug ? 'var(--color-vert)' : 'var(--color-border)',
                  background: sp.category === cat.slug ? 'var(--color-vert-light)' : '#fff',
                  color: sp.category === cat.slug ? 'var(--color-vert)' : 'var(--color-muted)',
                }}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        )}

        {result.items.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-3">
              <SearchX size={40} style={{ color: 'var(--color-subtle)' }} />
            </div>
            <p className="text-body" style={{ color: 'var(--color-muted)' }}>
              Aucun service trouvé.{' '}
              <Link href="/contribuer" style={{ color: 'var(--color-corail)' }}>
                Proposer un service ?
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
              if (sp.category) params.set('category', sp.category)
              params.set('page', String(p))
              return (
                <a
                  key={p}
                  href={`/services?${params}`}
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
