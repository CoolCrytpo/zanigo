'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { StagingListing } from '@/lib/ingestion/types'

const STATUS_LABEL: Record<string, string> = {
  raw_import: 'Brut', to_review: 'À revoir',
  duplicate_suspected: 'Doublon ?', approved: 'Approuvé',
  rejected: 'Rejeté', merged: 'Fusionné', published: 'Publié',
}
const STATUS_COLOR: Record<string, string> = {
  raw_import: '#6b7280', to_review: '#2563eb', duplicate_suspected: '#d97706',
  approved: '#16a34a', rejected: '#dc2626', merged: '#7c3aed', published: '#059669',
}
const POLICY_COLOR: Record<string, string> = {
  yes: '#16a34a', no: '#dc2626', conditional: '#d97706', unknown: '#9ca3af',
}

interface Props {
  items: StagingListing[]
  basePath: string
}

export function StagingBulkActions({ items, basePath }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const allIds = items.map(i => i.id)
  const allSelected = selected.size === allIds.length && allIds.length > 0

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds))
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function bulkReject() {
    if (selected.size === 0) return
    if (!confirm(`Rejeter ${selected.size} fiche(s) ? Cette action est irréversible.`)) return
    const res = await fetch('/api/admin/staging/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selected), action: 'reject', reason: 'Rejet en masse — contenu non exploitable' }),
    })
    if (res.ok) {
      setSelected(new Set())
      startTransition(() => router.refresh())
    }
  }

  async function bulkCreate() {
    if (selected.size === 0) return
    if (!confirm(`Créer ${selected.size} fiche(s) depuis le staging ? Elles seront créées avec le statut "à compléter".`)) return
    const res = await fetch('/api/admin/staging/batch-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selected) }),
    })
    const data = await res.json()
    if (res.ok) {
      alert(`✓ ${data.created} fiche(s) créée(s)${data.errors > 0 ? ` — ${data.errors} erreur(s)` : ''}.`)
      setSelected(new Set())
      startTransition(() => router.refresh())
    }
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-lg text-sm"
          style={{ background: '#fef3c7', border: '1px solid #fbbf24' }}>
          <span className="font-semibold text-amber-800">{selected.size} sélectionnée(s)</span>
          <button
            onClick={bulkCreate}
            disabled={isPending}
            className="px-3 py-1 rounded text-xs font-semibold text-white"
            style={{ background: '#2563eb', opacity: isPending ? 0.6 : 1 }}
          >
            ✓ Créer en lot
          </button>
          <button
            onClick={bulkReject}
            disabled={isPending}
            className="px-3 py-1 rounded text-xs font-semibold text-white"
            style={{ background: '#dc2626', opacity: isPending ? 0.6 : 1 }}
          >
            ✕ Rejeter la sélection
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-amber-700 underline"
          >
            Désélectionner
          </button>
        </div>
      )}

      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: '#e2e8f0' }}>
              <th className="py-2 px-3 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded accent-red-600"
                />
              </th>
              {['Nom', 'Commune', 'Catégorie', 'Policy', 'Confiance', 'Statut', 'Source', 'Action'].map(h => (
                <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}
                className="border-b hover:bg-gray-50"
                style={{ borderColor: '#f1f5f9', background: selected.has(item.id) ? '#fef2f2' : undefined }}>
                <td className="py-2 px-3">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggle(item.id)}
                    className="w-4 h-4 rounded accent-red-600"
                  />
                </td>
                <td className="py-2 px-3 font-medium max-w-xs" style={{ color: 'var(--color-basalte)' }}>
                  <div className="truncate">{item.name}</div>
                  {item.duplicate_of_listing_id && (
                    <span className="text-xs text-amber-600">⚠️ doublon probable</span>
                  )}
                </td>
                <td className="py-2 px-3 text-gray-500 text-xs">{item.commune_name ?? '—'}</td>
                <td className="py-2 px-3 text-gray-500 text-xs">{item.category ?? '—'}</td>
                <td className="py-2 px-3">
                  <span className="px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{ background: POLICY_COLOR[item.dog_policy] ?? '#9ca3af' }}>
                    {item.dog_policy}
                  </span>
                </td>
                <td className="py-2 px-3 text-xs font-semibold" style={{
                  color: item.confidence_score >= 70 ? '#16a34a' : item.confidence_score >= 50 ? '#d97706' : '#dc2626'
                }}>
                  {item.confidence_score}%
                </td>
                <td className="py-2 px-3">
                  <span className="px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{ background: STATUS_COLOR[item.status] ?? '#6b7280' }}>
                    {STATUS_LABEL[item.status] ?? item.status}
                  </span>
                </td>
                <td className="py-2 px-3 text-xs text-gray-400 max-w-24 truncate">
                  {item.source_domain ?? '—'}
                </td>
                <td className="py-2 px-3">
                  <a href={`${basePath}/${item.id}`}
                    className="text-xs font-semibold px-2 py-1 rounded"
                    style={{ background: '#f1f5f9', color: '#374151' }}>
                    Ouvrir
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
