import Link from 'next/link'
import Image from 'next/image'
import { MapPin, UtensilsCrossed, TreePine, Stethoscope, BedDouble } from 'lucide-react'
import type { Listing } from '@/lib/types'
import { ReactionBar } from '@/components/listings/ReactionBar'
import { LISTING_TYPE_PATHS, DOG_POLICY_COLORS } from '@/config/constants'

interface Props { listing: Listing }

// ── Category border color ────────────────────────────────────
const TYPE_ACCENT: Record<string, string> = {
  place:   '#FF6B57',
  walk:    '#1FA97E',
  spot:    '#1FA97E',
  service: '#8B5CF6',
}
const CATEGORY_ACCENT: Record<string, string> = {
  hotel:       '#2A74E6',
  gite:        '#2A74E6',
  hebergement: '#2A74E6',
  chambre:     '#2A74E6',
  camping:     '#2A74E6',
  pension:     '#2A74E6',
  location:    '#2A74E6',
  activite:    '#F4B73F',
}
const TYPE_BG: Record<string, string> = {
  place:   '#FFF3F1',
  walk:    '#EDFBF5',
  spot:    '#EDFBF5',
  service: '#F3EEFF',
}
const CATEGORY_BG: Record<string, string> = {
  hotel:       '#EEF4FF',
  gite:        '#EEF4FF',
  hebergement: '#EEF4FF',
  chambre:     '#EEF4FF',
  camping:     '#EEF4FF',
  pension:     '#EEF4FF',
  location:    '#EEF4FF',
}

function categoryAccent(listing: Listing): string {
  const slug = listing.category?.slug ?? ''
  for (const [key, color] of Object.entries(CATEGORY_ACCENT)) {
    if (slug.includes(key)) return color
  }
  return TYPE_ACCENT[listing.type] ?? '#94A3B8'
}

function categoryBg(listing: Listing): string {
  const slug = listing.category?.slug ?? ''
  for (const [key, bg] of Object.entries(CATEGORY_BG)) {
    if (slug.includes(key)) return bg
  }
  return TYPE_BG[listing.type] ?? '#f8fafc'
}

function policyAccent(status: string | null | undefined): string {
  return DOG_POLICY_COLORS[status ?? 'unknown'] ?? '#94A3B8'
}

function FallbackIcon({ listing, accent }: { listing: Listing; accent: string }) {
  const props = { size: 28, strokeWidth: 1.25, color: accent }
  const slug = listing.category?.slug ?? ''
  if (slug.includes('hotel') || slug.includes('gite') || slug.includes('hebergement')) return <BedDouble {...props} />
  if (listing.type === 'place')   return <UtensilsCrossed {...props} />
  if (listing.type === 'walk' || listing.type === 'spot') return <TreePine {...props} />
  if (listing.type === 'service') return <Stethoscope {...props} />
  return <MapPin {...props} />
}

export function ListingCard({ listing }: Props) {
  const href       = `${LISTING_TYPE_PATHS[listing.type] ?? '/lieux'}/${listing.slug}`
  const border     = categoryAccent(listing)
  const accent     = policyAccent(listing.dog_policy_status)
  const fallbackBg = categoryBg(listing)

  return (
    <article
      className="card flex flex-col overflow-hidden"
      style={{
        borderLeft: `3px solid ${border}`,
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = `0 8px 24px ${border}20, 0 2px 8px rgba(0,0,0,0.06)`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = ''
      }}
    >
      <Link href={href} className="flex flex-col flex-1 group" style={{ textDecoration: 'none', color: 'inherit' }}>
        {/* Square image */}
        <div className="relative overflow-hidden shrink-0" style={{ aspectRatio: '3/2', background: fallbackBg }}>
          {listing.cover_url ? (
            <Image
              src={listing.cover_url}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FallbackIcon listing={listing} accent={border} />
            </div>
          )}

          {/* Bottom gradient overlay */}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{ height: '45%', background: 'linear-gradient(to top, rgba(20,24,28,0.28) 0%, transparent 100%)' }}
          />

          {/* Dog policy micro-dot */}
          <div
            className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full"
            style={{ background: accent, boxShadow: `0 0 0 2px white, 0 0 0 3px ${accent}60` }}
            title={listing.dog_policy_status ?? 'inconnu'}
          />

          {/* Featured badge — gold gradient */}
          {listing.is_featured && (
            <span
              className="absolute top-2 right-2 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #F4B73F 0%, #E8A020 100%)',
                color: '#1A2030',
                boxShadow: '0 1px 4px rgba(228,160,32,0.35)',
              }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              À la une
            </span>
          )}

          {listing.is_sponsored && (
            <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(26,32,48,0.72)', color: '#fff' }}>
              Sponsorisé
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          {listing.category && (
            <span
              className="self-start text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${border}15`, color: border }}
            >
              {listing.category.label}
            </span>
          )}

          <h3
            className="font-semibold text-sm line-clamp-2 leading-snug"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            {listing.title}
          </h3>

          {listing.commune && (
            <p className="text-caption flex items-center gap-1">
              <MapPin size={10} strokeWidth={2} style={{ flexShrink: 0 }} />
              {listing.commune.name}
            </p>
          )}
        </div>
      </Link>

      {/* Reactions */}
      <div className="px-3 pb-2.5 pt-0 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <ReactionBar listingId={listing.id} />
      </div>
    </article>
  )
}
