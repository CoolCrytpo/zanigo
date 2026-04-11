import Link from 'next/link'
import Image from 'next/image'
import type { Listing } from '@/lib/types'
import { DogPolicyBadge } from '@/components/ui/DogPolicyBadge'
import { LISTING_TYPE_PATHS } from '@/config/constants'

interface Props {
  listing: Listing
}

export function ListingCard({ listing }: Props) {
  const href = `${LISTING_TYPE_PATHS[listing.type] ?? '/lieux'}/${listing.slug}`

  return (
    <Link href={href} className="card card-hover group block">
      {/* Photo */}
      <div
        className="relative h-44 overflow-hidden"
        style={{ background: 'var(--color-vert-light)' }}
      >
        {listing.cover_url ? (
          <Image
            src={listing.cover_url}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            {listing.category?.icon ?? '📍'}
          </div>
        )}
        {listing.is_featured && (
          <span
            className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-lg"
            style={{ background: 'var(--color-jaune)', color: 'var(--color-basalte)' }}
          >
            ⭐ À la une
          </span>
        )}
        {listing.is_sponsored && (
          <span
            className="absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
          >
            Sponsorisé
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {listing.category && (
          <p className="text-overline mb-1.5">
            {listing.category.icon} {listing.category.label}
          </p>
        )}
        <h3
          className="font-semibold text-sm mb-1 line-clamp-2"
          style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}
        >
          {listing.title}
        </h3>
        {listing.commune && (
          <p className="text-caption mb-3">
            📍 {listing.commune.name}
          </p>
        )}
        <DogPolicyBadge status={listing.dog_policy_status} size="sm" />
      </div>
    </Link>
  )
}
