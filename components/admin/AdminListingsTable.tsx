'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { Listing, VerificationStatus } from '@/lib/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DogPolicyBadge } from '@/components/ui/DogPolicyBadge'
import { formatDateShort } from '@/lib/utils'

interface Props {
  listings: Listing[]
}

const BULK_ACTIONS = [
  { value: 'publish',       label: '✅ Publier',         color: '#16a34a' },
  { value: 'unpublish',     label: '📝 Dépublier',       color: '#6b7280' },
  { value: 'needs_recheck', label: '🔄 Recheck',         color: '#f97316' },
  { value: 'archive',       label: '🗄️ Archiver',        color: '#dc2626' },
]

export function AdminListingsTable({ listings }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [applying, setApplying] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const allSelected = listings.length > 0 && selected.size === listings.length

  const toggleAll = useCallback(() => {
    setSelected(allSelected ? new Set() : new Set(listings.map((l) => l.id)))
  }, [allSelected, listings])

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const applyBulk = async (action: string) => {
    if (selected.size === 0) return
    setApplying(true)
    setFeedback(null)
    try {
      const res = await fetch('/api/admin/listings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected], action }),
      })
      const data = await res.json()
      setFeedback(`✅ ${data.updated ?? 0} fiche(s) mises à jour`)
      setSelected(new Set())
      setTimeout(() => window.location.reload(), 800)
    } catch {
      setFeedback('❌ Erreur lors de l\'action')
    } finally {
      setApplying(false)
    }
  }

  const TYPE_ICONS: Record<string, string> = {
    place: '🏠', spot: '📍', walk: '🥾', service: '🐾',
  }

  return (
    <>
      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div
          className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl flex-wrap"
          style={{ background: '#fffbeb', border: '1.5px solid #fde68a' }}
        >
          <span className="text-sm font-bold" style={{ color: '#92400e' }}>
            {selected.size} sélectionné(s)
          </span>
          <div className="flex gap-2 flex-wrap">
            {BULK_ACTIONS.map((a) => (
              <button
                key={a.value}
                onClick={() => void applyBulk(a.value)}
                disabled={applying}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                style={{ background: 'white', color: a.color, border: `1.5px solid ${a.color}30` }}
              >
                {applying ? '…' : a.label}
              </button>
            ))}
          </div>
          {feedback && (
            <span className="text-xs font-semibold text-green-700">{feedback}</span>
          )}
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600"
          >
            Désélectionner
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded"
                  aria-label="Tout sélectionner"
                />
              </th>
              <th className="text-left px-4 py-3">Nom</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Type</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Commune</th>
              <th className="text-left px-4 py-3">Chiens</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Modifié</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listings.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">Aucune fiche trouvée</td>
              </tr>
            )}
            {listings.map((listing) => {
              const isSelected = selected.has(listing.id)
              const path = { place: 'lieux', spot: 'spots', walk: 'balades', service: 'services' }[listing.type] ?? 'lieux'
              return (
                <tr
                  key={listing.id}
                  className="hover:bg-gray-50 transition-colors"
                  style={{ background: isSelected ? '#fffbeb' : undefined }}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(listing.id)}
                      className="rounded"
                      aria-label={`Sélectionner ${listing.title}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[180px]">{listing.title}</p>
                    <p className="text-xs text-gray-400">{listing.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                    {TYPE_ICONS[listing.type]} {listing.category?.label ?? listing.type}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                    {listing.commune?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <DogPolicyBadge status={listing.dog_policy_status} size="sm" showIcon={false} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={listing.verification_status as VerificationStatus} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">
                    {formatDateShort(listing.updated_at)}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <Link
                      href={`/admin/listings/${listing.id}`}
                      className="text-xs font-medium hover:underline"
                      style={{ color: 'var(--color-vert)' }}
                    >
                      Éditer
                    </Link>
                    <a
                      href={`/${path}/${listing.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:underline"
                    >
                      ↗
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
