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
import { APP_URL } from '@/config/constants'

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const listing = await getListingBySlug(slug)
    if (!listing) return {}
    return { title: listing.title, description: listing.short_description ?? undefined }
  } catch { return {} }
}

export default async function ServiceFichePage({ params }: PageProps) {
  const { slug } = await params
  let listing = null
  let reactionCounts = { useful: 0, thanks: 0, love: 0, oops: 0 }
  try {
    listing = await getListingBySlug(slug)
    if (listing) reactionCounts = await getReactionCounts(listing.id)
  } catch { notFound() }
  if (!listing) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.title,
    description: listing.short_description ?? undefined,
    url: `${APP_URL}/services/${listing.slug}`,
    telephone: listing.contact_phone ?? undefined,
    address: listing.address ?? undefined,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ background: 'var(--color-sable)', minHeight: '100dvh' }}>
        <div className="relative h-48 md:h-64" style={{ background: 'var(--color-basalte)' }}>
          {listing.cover_url ? (
            <Image src={listing.cover_url} alt={listing.title} fill className="object-cover opacity-80" priority sizes="100vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">{listing.category?.icon ?? '🐾'}</div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(31,35,32,0.8) 0%, transparent 55%)' }} />
          <div className="absolute bottom-0 left-0 right-0 container pb-5">
            <p className="text-overline mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {listing.category?.icon} {listing.category?.label}{listing.commune && ` — ${listing.commune.name}`}
            </p>
            <h1 className="text-h1 text-white" style={{ fontFamily: 'var(--font-display)' }}>{listing.title}</h1>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              {(listing.short_description || listing.long_description) && (
                <div className="card p-5">
                  {listing.short_description && <p className="text-body-lg mb-3">{listing.short_description}</p>}
                  {listing.long_description && <p className="text-body" style={{ color: 'var(--color-muted)' }}>{listing.long_description}</p>}
                </div>
              )}
              <div className="card p-5">
                <h2 className="text-overline mb-3">Chiens</h2>
                <div className="flex flex-wrap items-start gap-4">
                  <DogPolicyBadge status={listing.dog_policy_status} size="lg" />
                  {listing.dog_policy_rules && <p className="text-body">{listing.dog_policy_rules}</p>}
                </div>
              </div>
              <div className="card p-5">
                <h2 className="text-overline mb-3">Utile ?</h2>
                <ReactionBar listingId={listing.id} initialCounts={reactionCounts} />
              </div>
              <AdSlot slotKey="detail_footer_partner" />
              <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--color-vert-light)', border: '1px solid rgba(47,107,87,0.2)' }}>
                <p style={{ color: 'var(--color-muted)' }}>
                  Info incorrecte ?{' '}
                  <Link href="/contribuer" style={{ color: 'var(--color-vert)', fontWeight: 600 }}>Signaler</Link>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="card p-5">
                <h2 className="text-overline mb-3">Contact</h2>
                <div className="flex flex-col gap-3 text-sm">
                  {listing.address && (
                    <div className="flex gap-2"><span>📍</span><span style={{ color: 'var(--color-text)' }}>{listing.address}</span></div>
                  )}
                  {listing.contact_phone && (
                    <div className="flex gap-2"><span>📞</span>
                      <a href={`tel:${listing.contact_phone}`} className="font-medium" style={{ color: 'var(--color-vert)' }}>
                        {formatPhone(listing.contact_phone)}
                      </a>
                    </div>
                  )}
                  {listing.contact_email && (
                    <div className="flex gap-2"><span>✉️</span>
                      <a href={`mailto:${listing.contact_email}`} style={{ color: 'var(--color-lagon)' }}>{listing.contact_email}</a>
                    </div>
                  )}
                  {listing.website_url && (
                    <div className="flex gap-2"><span>🌐</span>
                      <a href={listing.website_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-lagon)' }}>Site web</a>
                    </div>
                  )}
                </div>
                {listing.lat && listing.lng && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'var(--color-lagon)' }}
                  >
                    🗺️ Itinéraire
                  </a>
                )}
              </div>
              <div className="card p-5">
                <h2 className="text-overline mb-3">Fiabilité</h2>
                <TrustBadge level={listing.trust_level} verifiedAt={listing.verified_at} />
                {listing.verified_at && <p className="text-caption mt-2">Vérifié le {formatDate(listing.verified_at)}</p>}
              </div>
              <AdSlot slotKey="detail_sidebar_partner" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
