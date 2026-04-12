import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Droplets, AlertTriangle, Trees, Waves, Mountain, Map } from 'lucide-react'
import { getListingBySlug, getReactionCounts } from '@/lib/db/queries'
import { DogPolicyBadge } from '@/components/ui/DogPolicyBadge'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { AdSlot } from '@/components/sponsor/AdSlot'
import { ReactionBar } from '@/features/reactions/ReactionBar'
import { formatDate, formatDistance, formatElevation, formatDuration } from '@/lib/utils'
import { APP_URL, TRAIL_DIFFICULTY_LABELS, TRAIL_DIFFICULTY_COLORS } from '@/config/constants'

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
    }
  } catch { return {} }
}

export default async function BaladeFichePage({ params }: PageProps) {
  const { slug } = await params

  let listing = null
  let reactionCounts = { useful: 0, thanks: 0, love: 0, oops: 0 }

  try {
    listing = await getListingBySlug(slug)
    if (listing) reactionCounts = await getReactionCounts(listing.id)
  } catch { notFound() }

  if (!listing) notFound()

  const td = listing.trail_details

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LandmarksOrHistoricalBuildings',
    name: listing.title,
    description: listing.short_description ?? undefined,
    url: `${APP_URL}/balades/${listing.slug}`,
    geo: listing.lat && listing.lng ? {
      '@type': 'GeoCoordinates',
      latitude: listing.lat,
      longitude: listing.lng,
    } : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ background: 'var(--color-sable)', minHeight: '100dvh' }}>
        {/* Hero */}
        <div className="relative h-64 md:h-80" style={{ background: 'var(--color-basalte)' }}>
          {listing.cover_url ? (
            <Image src={listing.cover_url} alt={listing.title} fill className="object-cover opacity-80" priority sizes="100vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(31,35,32,0.85) 0%, transparent 55%)' }} />

          {/* Difficulty badge */}
          {td?.difficulty && (
            <div className="absolute top-4 right-4">
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                style={{ background: TRAIL_DIFFICULTY_COLORS[td.difficulty] }}
              >
                {TRAIL_DIFFICULTY_LABELS[td.difficulty]}
              </span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 container pb-6">
            <p className="text-overline mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Balade{listing.commune && ` — ${listing.commune.name}`}
            </p>
            <h1 className="text-h1 text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {listing.title}
            </h1>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Trail stats */}
              {td && (
                <div className="card p-5">
                  <h2 className="text-overline mb-4">Infos parcours</h2>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {td.distance_km && (
                      <div className="text-center">
                        <p className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
                          {formatDistance(td.distance_km)}
                        </p>
                        <p className="text-caption">Distance</p>
                      </div>
                    )}
                    {td.elevation_m && (
                      <div className="text-center">
                        <p className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
                          {formatElevation(td.elevation_m)}
                        </p>
                        <p className="text-caption">Dénivelé</p>
                      </div>
                    )}
                    {td.duration_minutes && (
                      <div className="text-center">
                        <p className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
                          {formatDuration(td.duration_minutes)}
                        </p>
                        <p className="text-caption">Durée</p>
                      </div>
                    )}
                  </div>

                  {/* Dog-specific trail info */}
                  <div className="flex flex-wrap gap-2">
                    {td.leash_required && (
                      <span className="text-xs px-3 py-1 rounded-full inline-flex items-center gap-1" style={{ background: '#fef3c7', color: '#92400e' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        Laisse obligatoire
                      </span>
                    )}
                    {td.has_water_points && (
                      <span className="text-xs px-3 py-1 rounded-full inline-flex items-center gap-1" style={{ background: 'var(--color-vert-light)', color: 'var(--color-vert)' }}>
                        <Droplets size={11} /> Point d&apos;eau
                      </span>
                    )}
                    {td.regulated_zones && (
                      <span className="text-xs px-3 py-1 rounded-full inline-flex items-center gap-1" style={{ background: '#fee2e2', color: '#991b1b' }}>
                        <AlertTriangle size={11} /> Zone réglementée
                      </span>
                    )}
                    {td.terrain_type && (
                      <span className="text-xs px-3 py-1 rounded-full inline-flex items-center gap-1" style={{ background: 'var(--color-vert-light)', color: 'var(--color-vert)' }}>
                        {td.terrain_type === 'forest'   && <><Trees size={11} /> Forêt</>}
                        {td.terrain_type === 'coastal'  && <><Waves size={11} /> Côtier</>}
                        {td.terrain_type === 'mountain' && <><Mountain size={11} /> Montagne</>}
                        {td.terrain_type === 'mixed'    && <><Map size={11} /> Mixte</>}
                      </span>
                    )}
                  </div>

                  {td.water_points_desc && (
                    <p className="text-caption mt-3 flex items-center gap-1"><Droplets size={11} /> {td.water_points_desc}</p>
                  )}
                  {td.regulated_zones && (
                    <p className="text-caption mt-1 flex items-center gap-1" style={{ color: '#991b1b' }}><AlertTriangle size={11} /> {td.regulated_zones}</p>
                  )}
                </div>
              )}

              {/* Dog policy */}
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
                    <p className="text-body-lg mb-3">{listing.short_description}</p>
                  )}
                  {listing.long_description && (
                    <p className="text-body" style={{ color: 'var(--color-muted)' }}>
                      {listing.long_description}
                    </p>
                  )}
                </div>
              )}

              {/* Reactions */}
              <div className="card p-5">
                <h2 className="text-overline mb-3">Utile ?</h2>
                <ReactionBar listingId={listing.id} initialCounts={reactionCounts} />
              </div>

              <AdSlot slotKey="detail_footer_partner" />

              <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--color-vert-light)', border: '1px solid rgba(47,107,87,0.2)' }}>
                <p style={{ color: 'var(--color-muted)' }}>
                  Infos incorrectes ?{' '}
                  <Link href="/contribuer" style={{ color: 'var(--color-vert)', fontWeight: 600 }}>
                    Signaler
                  </Link>
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              <div className="card p-5">
                <h2 className="text-overline mb-3">Fiabilité</h2>
                <TrustBadge level={listing.trust_level} verifiedAt={listing.verified_at} />
                {listing.verified_at && (
                  <p className="text-caption mt-2">Vérifié le {formatDate(listing.verified_at)}</p>
                )}
              </div>

              {/* Start point / itinerary */}
              {td?.start_lat && td?.start_lng && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${td.start_lat},${td.start_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'var(--color-lagon)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                  Point de départ
                </a>
              )}

              <AdSlot slotKey="detail_sidebar_partner" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
