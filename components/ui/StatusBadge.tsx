import type { VerificationStatus } from '@/lib/types'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  published:      { label: 'Publié',       color: '#16a34a' },
  draft:          { label: 'Brouillon',    color: '#6b7280' },
  pending_review: { label: 'En attente',   color: '#d97706' },
  needs_recheck:  { label: 'À revérifier', color: '#f97316' },
  conflict:       { label: 'Conflit',      color: '#7c3aed' },
  archived:       { label: 'Archivé',      color: '#dc2626' },
}

interface Props {
  status: VerificationStatus | string | null | undefined
}

export function StatusBadge({ status }: Props) {
  const cfg = STATUS_CONFIG[status ?? ''] ?? { label: status ?? '—', color: '#6b7280' }
  return (
    <span
      className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${cfg.color}18`, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}
