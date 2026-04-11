import Link from 'next/link'
import Image from 'next/image'
import { MapPin, UtensilsCrossed, TreePine, Stethoscope, Star } from 'lucide-react'
import type { Listing } from '@/lib/types'
import { DogPolicyBadge } from '@/components/ui/DogPolicyBadge'
import { ReactionBar } from '@/components/listings/ReactionBar'
import { LISTING_TYPE_PATHS } from '@/config/constants'

interface Props { listing: Listing }

function TypeIcon({ type }: { type: string }) {
  const props = { size: 28, strokeWidth: 1.25, color: 'var(--color-muted)' }
  if (type === 'place')   return <UtensilsCrossed {...props} />
  if (type === 'walk')    return <TreePine {...props} />
  if (type === 'service') return <Stethoscope {...props} />
  return <MapPin {...props} />
}

export function ListingCard({ listing }: Props) {
  const href = `${LISTING_TYPE_PATHS[listing.type] ?? '/lieux'}/${listing.slug}`

  return (
    <article className="card card-hover flex flex-col">
      <Link href={href} className="flex flex-col flex-1 group" style={{ textDecoration: 'none', color: 'inherit' }}>
        {/* Image */}
        <div className="relative h-44 overflow-hidden shrink-0" style={{ background: 'var(--color-canvas)' }}>
          {listing.cover_url ? (
            <Image src={listing.cover_url} alt={listing.title} fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TypeIcon type={listing.type} />
            </div>
          )}
          {listing.is_featured && (
            <span className="absolute top-2 left-2 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg"
              style={{ background: 'var(--color-yellow)', color: '#1A2030' }}>
              <Star size={9} fill="currentColor" strokeWidth={0} /> À la une
            </span>
          )}
          {listing.is_sponsored && (
            <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-lg"
              style={{ background: 'rgba(26,32,48,0.72)', color: '#fff' }}>
              Sponsorisé
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-1.5 flex-1">
          {listing.category && (
            <p className="text-overline">{listing.category.label}</p>
          )}
          <h3 className="font-semibold text-sm line-clamp-2 leading-snug"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            {listing.title}
          </h3>
          {listing.commune && (
            <p className="text-caption flex items-center gap-1">
              <MapPin size={11} strokeWidth={2} style={{ flexShrink: 0 }} />
              {listing.commune.name}
            </p>
          )}
          <div className="mt-auto pt-2">
            <DogPolicyBadge status={listing.dog_policy_status} size="sm" />
          </div>
        </div>
      </Link>

      {/* Reactions — outside Link to avoid nested interactive */}
      <div className="px-4 pb-3 pt-0 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <ReactionBar listingId={listing.id} />
      </div>
    </article>
  )
}
