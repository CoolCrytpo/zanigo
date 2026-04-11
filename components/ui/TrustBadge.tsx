import { TRUST_LEVEL_LABELS } from '@/config/constants'
import type { TrustLevel } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface Props {
  level: TrustLevel | null | undefined
  verifiedAt?: string | null
  showDate?: boolean
}

const TRUST_COLORS: Record<string, string> = {
  high:   '#16a34a',
  medium: '#d97706',
  low:    '#6b7280',
}

const TRUST_ICONS: Record<string, string> = {
  high:   '✓',
  medium: '~',
  low:    '?',
}

export function TrustBadge({ level, verifiedAt, showDate = true }: Props) {
  const l = level ?? 'low'
  const label = TRUST_LEVEL_LABELS[l] ?? 'Inconnu'
  const color = TRUST_COLORS[l] ?? '#6b7280'
  const icon = TRUST_ICONS[l]

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
      >
        <span className="text-xs" aria-hidden>{icon}</span>
        {label}
      </span>
      {showDate && verifiedAt && (
        <span className="text-caption">
          {formatDate(verifiedAt)}
        </span>
      )}
    </div>
  )
}
