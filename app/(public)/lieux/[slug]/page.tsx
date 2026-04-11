import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getListingBySlug, getReactionCounts } from '@/lib/db/queries'
import { DogPolicyBadge } from '@/components/ui/DogPolicyBadge'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { AdSlot } from '@/components/sponsor/AdSlot'
import { ReactionBar } from '@/features/reactions/ReactionBar'
import { formatDate, formatPhone } from '@/lib/utils'
import { APP_URL, APP_NAME } from '@/config/constants'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const listing = await getListingBySlug(slug)
    if (!listing) return {}
    return {
      title: listing.title,
      description: listing.short_description ?? undefined,
      openGraph: {
        title: listing.title,
        description: listing.short_description ?? undefined,
        images: listing.cover_url ? [listing.cover_url] : [],
      },
    }
  } catch {
    return {}
  }
}

export default async function LieuFichePage({ params }: PageProps) {
  const { slug } = await params

  let listing = null
  let reactionCounts = { useful: 0, thanks: 0, love: 0, oops: 0 }

  try {
    ;[listing, reactionCounts] = await Promise.all([
      getListingBySlug(slug),
      getListingBySlug(slug).then((l) => l ? getReactionCounts(l.id) : Promise.resolve(reactionCounts)),
    ])
  } catch {
    notFound()
  }

  if (!listing) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.title,
    description: listing.short_description ?? undefined,
    address: listing.address ?? undefined,
    geo: listing.lat && listing.lng ? {
      '@type': 'GeoCoordinates',
      latitude: listing.lat,
      longitude: listing.lng,
    } : undefined,
    url: `${APP_URL}/lieux/${listing.slug}`,
    telephone: listing.contact_phone ?? undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ background: 'var(--color-sable)', minHeight: '100dvh' }}>
        {/* Hero */}
        <div
          className="relative h-64 md:h-80"
          style={{ background: 'var(--color-basalte)' }}
        >
          {listing.cover_url ? (
            <Image
              src={listing.cover_url}
              alt={listing.title}
              fill
              className="object-cover opacity-80"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {listing.category?.icon ?? '📍'}
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(31,35,32,0.8) 0%, transparent 60%)' }}
          />
          <div className="absolute bottom-0 left-0 right-0 container pb-6">
            <p className="text-overline mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {listing.category?.icon} {listing.category?.label}
              {listing.commune && ` — ${listing.commune.name}`}
            </p>
            <h1
              className="text-h1 text-white"
              style={{ fontFamily: 'var(--font-display)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
            >
              {listing.title}
            </h1>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Status bloc */}
              <div className="card p-5">
                <h2 className="text-overline mb-3">Chiens</h2>
                <div className="flex flex-wrap items-start gap-4">
                  <DogPolicyBadge status={listing.dog_policy_status} size="lg" />
                  {listing.dog_policy_rules && (
                    <p className="text-body" style={{ color: 'var(--color-text)' }}>
                      {listing.dog_policy_rules}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {(listing.short_description || listing.long_description) && (
                <div className="card p-5">
                  {listing.short_description && (
                    <p className="text-body-lg mb-3" style={{ color: 'var(--color-text)' }}>
                      {listing.short_description}
                    </p>
                  )}
                  {listing.long_description && (
                    <p className="text-body" style={{ color: 'var(--color-muted)' }}>
                      {listing.long_description}
                    </p>
                  )}
                </div>
              )}

              {/* Amenities */}
              {listing.amenities.length > 0 && (
                <div className="card p-5">
                  <h2 className="text-overline mb-3">Équipements</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.amenities.map((a) => (
                      <span
                        key={a.id}
                        className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full"
                        style={{ background: 'var(--color-vert-light)', color: 'var(--color-vert)' }}
                      >
                        {a.icon} {a.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reactions */}
              <div className="card p-5">
                <h2 className="text-overline mb-3">Utile ?</h2>
                <ReactionBar listingId={listing.id} initialCounts={reactionCounts} />
              </div>

              {/* Ad slot */}
              <AdSlot slotKey="detail_footer_partner" />

              {/* Correction CTA */}
              <div
                className="p-4 rounded-xl text-sm"
                style={{ background: 'var(--color-vert-light)', border: '1px solid rgba(47,107,87,0.2)' }}
              >
                <p style={{ color: 'var(--color-muted)' }}>
                  Une info incorrecte ou manquante ?{' '}
                  <Link href="/contribuer" style={{ color: 'var(--color-vert)', fontWeight: 600 }}>
                    Signaler une correction
                  </Link>
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              {/* Trust */}
              <div className="card p-5">
                <h2 className="text-overline mb-3">Fiabilité</h2>
                <TrustBadge level={listing.trust_level} verifiedAt={listing.verified_at} />
                {listing.verified_at && (
                  <p className="text-caption mt-2">
                    Vérifié le {formatDate(listing.verified_at)}
                  </p>
                )}
              </div>

              {/* Practical info */}
              <div className="card p-5">
                <h2 className="text-overline mb-3">Infos pratiques</h2>
                <div className="flex flex-col gap-2 text-sm">
                  {listing.address && (
                    <div className="flex gap-2">
                      <span>📍</span>
                      <span style={{ color: 'var(--color-text)' }}>{listing.address}</span>
                    </div>
                  )}
                  {listing.contact_phone && (
                    <div className="flex gap-2">
                      <span>📞</span>
                      <a
                        href={`tel:${listing.contact_phone}`}
                        style={{ color: 'var(--color-vert)' }}
                      >
                        {formatPhone(listing.contact_phone)}
                      </a>
                    </div>
                  )}
                  {listing.website_url && (
                    <div className="flex gap-2">
                      <span>🌐</span>
                      <a
                        href={listing.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate"
                        style={{ color: 'var(--color-lagon)' }}
                      >
                        Site web
                      </a>
                    </div>
                  )}
                </div>

                {listing.lat && listing.lng && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: 'var(--color-lagon)' }}
                  >
                    🗺️ Itinéraire
                  </a>
                )}
              </div>

              {/* Ad slot sidebar */}
              <AdSlot slotKey="detail_sidebar_partner" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
