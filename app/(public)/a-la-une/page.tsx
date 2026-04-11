import type { Metadata } from 'next'
import { getPublishedListings } from '@/lib/db/queries'
import { ListingCard } from '@/components/listings/ListingCard'
import { AdSlot } from '@/components/sponsor/AdSlot'

export const metadata: Metadata = {
  title: 'À la une — Zanimo Guide',
  description: 'Les meilleures adresses dog-friendly mises en avant à La Réunion.',
}

export default async function ALaUnePage() {
  let featured = { items: [] as Awaited<ReturnType<typeof getPublishedListings>>['items'], total: 0, page: 1, per_page: 24 }

  try {
    const result = await getPublishedListings({ page: 1, per_page: 24 })
    // Filter only featured
    featured = {
      ...result,
      items: result.items.filter((l) => l.is_featured),
    }
  } catch { /* DB not ready */ }

  return (
    <div className="section" style={{ background: 'var(--color-sable)' }}>
      <div className="container">
        <div className="mb-6">
          <p className="text-overline mb-2" style={{ color: 'var(--color-jaune)' }}>⭐ Sélection</p>
          <h1 className="text-h1" style={{ color: 'var(--color-basalte)' }}>À la une</h1>
          <p className="text-body mt-1" style={{ color: 'var(--color-muted)' }}>
            Les adresses mises en avant par Zanimo Guide.
          </p>
        </div>

        <AdSlot slotKey="home_inline_1" className="mb-6" />

        {featured.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">⭐</p>
            <p className="text-body" style={{ color: 'var(--color-muted)' }}>
              Aucune fiche mise en avant pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
