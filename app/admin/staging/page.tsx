import { requireSession } from '@/lib/auth/session'
import { getStagingListings } from '@/lib/ingestion/queries'
import Link from 'next/link'
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

interface PageProps {
  searchParams: Promise<{ status?: string; batch_id?: string; q?: string; page?: string; duplicate_only?: string }>
}

const STATUS_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'to_review', label: 'À revoir' },
  { value: 'duplicate_suspected', label: 'Doublons suspects' },
  { value: 'approved', label: 'Approuvés' },
  { value: 'rejected', label: 'Rejetés' },
  { value: 'published', label: 'Publiés' },
]

export default async function StagingPage({ searchParams }: PageProps) {
  await requireSession()
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))

  let result = { items: [] as StagingListing[], total: 0 }
  try {
    result = await getStagingListings({
      status: sp.status, batch_id: sp.batch_id, q: sp.q,
      duplicate_only: sp.duplicate_only === 'true', page, per_page: 30,
    })
  } catch { /* DB */ }

  const totalPages = Math.ceil(result.total / 30)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
          Zone de staging <span className="text-sm font-normal text-gray-400">({result.total})</span>
        </h1>
        <Link href="/admin/import"
          className="text-sm px-3 py-1.5 rounded-lg border" style={{ borderColor: '#e2e8f0', color: '#374151' }}>
          ← Import
        </Link>
      </div>

      <form method="GET" className="flex flex-wrap gap-2 mb-5">
        <input name="q" defaultValue={sp.q} placeholder="Rechercher…"
          className="flex-1 min-w-32 border rounded-lg px-3 py-1.5 text-sm focus:outline-none"
          style={{ borderColor: '#e2e8f0' }} />
        <select name="status" defaultValue={sp.status ?? ''}
          className="border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none"
          style={{ borderColor: '#e2e8f0' }}>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button type="submit" className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#374151' }}>Filtrer</button>
      </form>

      {result.items.length === 0 ? (
        <div className="card p-6 text-center text-sm text-gray-400">
          Aucune pré-fiche en staging. <Link href="/admin/import" className="underline">Lancer un import</Link>
        </div>
      ) : (
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#e2e8f0' }}>
                {['Nom','Commune','Catégorie','Policy','Confiance','Statut','Source','Action'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.items.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#f1f5f9' }}>
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
                    <Link href={`/admin/staging/${item.id}`}
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{ background: '#f1f5f9', color: '#374151' }}>
                      Ouvrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
            const params = new URLSearchParams()
            if (sp.q) params.set('q', sp.q)
            if (sp.status) params.set('status', sp.status)
            if (sp.batch_id) params.set('batch_id', sp.batch_id)
            params.set('page', String(p))
            return (
              <a key={p} href={`/admin/staging?${params}`}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: p === page ? 'var(--color-vert)' : '#f1f5f9', color: p === page ? '#fff' : '#374151' }}>
                {p}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
