import { getActiveAdSlot } from '@/lib/db/queries'
import Image from 'next/image'

interface Props {
  slotKey: string
  className?: string
}

export async function AdSlot({ slotKey, className }: Props) {
  let slot
  try {
    slot = await getActiveAdSlot(slotKey)
  } catch {
    return null
  }

  if (!slot?.campaign) return null

  const { campaign } = slot

  return (
    <div
      className={className}
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: 'var(--color-surface)',
      }}
    >
      <p
        className="text-overline px-3 py-1.5"
        style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
      >
        Sponsorisé
      </p>
      <a
        href={campaign.cta_url ?? '#'}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block"
      >
        {campaign.asset_url && (
          <div className="relative h-32">
            <Image
              src={campaign.asset_url}
              alt={slot.label}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 400px"
            />
          </div>
        )}
        {(campaign.title || campaign.cta_label) && (
          <div className="px-4 py-3">
            {campaign.title && (
              <p className="font-semibold text-sm" style={{ color: 'var(--color-basalte)' }}>
                {campaign.title}
              </p>
            )}
            {campaign.cta_label && (
              <p className="text-xs mt-1" style={{ color: 'var(--color-corail)' }}>
                {campaign.cta_label} →
              </p>
            )}
          </div>
        )}
      </a>
    </div>
  )
}
