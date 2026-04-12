import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react'
import { DOG_POLICY_LABELS, DOG_POLICY_COLORS } from '@/config/constants'
import type { DogPolicyStatus } from '@/lib/types'

interface Props {
  status: DogPolicyStatus | null | undefined
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

function PolicyIcon({ status, size }: { status: string; size: number }) {
  const props = { size, strokeWidth: 2 }
  if (status === 'allowed')     return <CheckCircle {...props} />
  if (status === 'conditional') return <AlertTriangle {...props} />
  if (status === 'disallowed')  return <XCircle {...props} />
  return <HelpCircle {...props} />
}

export function DogPolicyBadge({ status, size = 'md', showIcon = true }: Props) {
  const s = status ?? 'unknown'
  const label = DOG_POLICY_LABELS[s] ?? 'Inconnu'
  const color = DOG_POLICY_COLORS[s] ?? '#6b7280'

  const padding = size === 'sm' ? '2px 8px' : size === 'lg' ? '6px 14px' : '4px 10px'
  const fontSize = size === 'sm' ? '0.75rem' : size === 'lg' ? '0.9375rem' : '0.8125rem'
  const iconSize = size === 'sm' ? 11 : size === 'lg' ? 15 : 12

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
      {showIcon && <PolicyIcon status={s} size={iconSize} />}
      {label}
    </span>
  )
}
