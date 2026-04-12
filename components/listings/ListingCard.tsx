import Link from 'next/link'
import Image from 'next/image'
import { MapPin, UtensilsCrossed, TreePine, Stethoscope, Star } from 'lucide-react'
import type { Listing } from '@/lib/types'
import { DogPolicyBadge } from '@/components/ui/DogPolicyBadge'
import { ReactionBar } from '@/components/listings/ReactionBar'
import { LISTING_TYPE_PATHS, DOG_POLICY_COLORS } from '@/config/constants'

interface Props { listing: Listing }

function TypeIcon({ type }: { type: string }) {
  const props = { size: 28, strokeWidth: 1.25, color: 'var(--color-muted)' }
  if (type === 'place')   return <UtensilsCrossed {...props} />
  if (type === 'walk')    return <TreePine {...props} />
  if (type === 'service') return <Stethoscope {...props} />
  return <MapPin {...props} />
}

// Subtle left-edge indicator color based on dog policy
function policyAccent(status: string | null | undefined): string {
  return DOG_POLICY_COLORS[status ?? 'unknown'] ?? '#94A3B8'
}

// Border color = listing type / category
const TYPE_ACCENT: Record<string, string> = {
  place:   '#FF6B57',
  walk:    '#1FA97E',
  spot:    '#1FA97E',
  service: '#8B5CF6',
}
// Override for specific category slugs (hebergements are type='place' but different color)
const CATEGORY_ACCENT: Record<string, string> = {
  hotel:       '#2A74E6',
  gite:        '#2A74E6',
  hebergement: '#2A74E6',
  chambre:     '#2A74E6',
  camping:     '#2A74E6',
  pension:     '#2A74E6',
  location:    '#2A74E6',
  activite:    '#F4B73F',
  spa:         '#F4B73F',
}
function categoryAccent(listing: Listing): string {
  const slug = listing.category?.slug ?? ''
  for (const [key, color] of Object.entries(CATEGORY_ACCENT)) {
    if (slug.includes(key)) return color
  }
  return TYPE_ACCENT[listing.type] ?? '#94A3B8'
}

export function ListingCard({ listing }: Props) {
  const href = `${LISTING_TYPE_PATHS[listing.type] ?? '/lieux'}/${listing.slug}`
  const border = categoryAccent(listing)
  const accent = policyAccent(listing.dog_policy_status)

  return (
    <article
      className="card card-hover flex flex-col overflow-hidden"
      style={{
        borderLeft: `3px solid ${border}`,
        boxShadow: listing.dog_policy_status === 'allowed'
          ? `0 0 0 1px ${border}20, 0 2px 8px ${border}12`
          : undefined,
      }}
    >
      <Link href={href} className="flex flex-col flex-1 group" style={{ textDecoration: 'none', color: 'inherit' }}>
        {/* Square image */}
        <div className="relative overflow-hidden shrink-0" style={{ aspectRatio: '1/1', background: 'var(--color-canvas)' }}>
          {listing.cover_url ? (
            <Image src={listing.cover_url} alt={listing.title} fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TypeIcon type={listing.type} />
            </div>
          )}

          {/* Dog policy micro-indicator — top-left corner dot */}
          <div
            className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full"
            style={{
              background: accent,
              boxShadow: `0 0 0 2px white, 0 0 0 3px ${accent}60`,
            }}
            title={listing.dog_policy_status ?? 'inconnu'}
          />

          {listing.is_featured && (
            <span className="absolute top-2 right-2 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg"
              style={{ background: 'var(--color-yellow)', color: '#1A2030' }}>
              <Star size={9} fill="currentColor" strokeWidth={0} /> À la une
            </span>
          )}
          {listing.is_sponsored && (
            <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-lg"
              style={{ background: 'rgba(26,32,48,0.72)', color: '#fff' }}>
              Sponsorisé
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col gap-1 flex-1">
          {listing.category && (
            <p className="text-overline">{listing.category.label}</p>
          )}
          <h3 className="font-semibold text-sm line-clamp-2 leading-snug"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            {listing.title}
          </h3>
          {listing.commune && (
            <p className="text-caption flex items-center gap-1">
              <MapPin size={10} strokeWidth={2} style={{ flexShrink: 0 }} />
              {listing.commune.name}
            </p>
          )}
          <div className="mt-auto pt-1.5">
            <DogPolicyBadge status={listing.dog_policy_status} size="sm" />
          </div>
        </div>
      </Link>

      {/* Reactions — outside Link */}
      <div className="px-3 pb-2.5 pt-0 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <ReactionBar listingId={listing.id} />
      </div>
    </article>
  )
}
