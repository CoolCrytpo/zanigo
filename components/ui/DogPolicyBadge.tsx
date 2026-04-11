import { DOG_POLICY_LABELS, DOG_POLICY_COLORS } from '@/config/constants'
import type { DogPolicyStatus } from '@/lib/types'

interface Props {
  status: DogPolicyStatus | null | undefined
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const ICONS: Record<string, string> = {
  allowed:     '✅',
  conditional: '⚠️',
  disallowed:  '🚫',
  unknown:     '❓',
}

export function DogPolicyBadge({ status, size = 'md', showIcon = true }: Props) {
  const s = status ?? 'unknown'
  const label = DOG_POLICY_LABELS[s] ?? 'Inconnu'
  const color = DOG_POLICY_COLORS[s] ?? '#6b7280'
  const icon = ICONS[s]

  const padding = size === 'sm' ? '2px 8px' : size === 'lg' ? '6px 14px' : '4px 10px'
  const fontSize = size === 'sm' ? '0.75rem' : size === 'lg' ? '0.9375rem' : '0.8125rem'

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap"
      style={{
        padding,
        fontSize,
        background: `${color}18`,
        color,
        border: `1px solid ${color}30`,
      }}
    >
      {showIcon && <span aria-hidden>{icon}</span>}
      {label}
    </span>
  )
}
