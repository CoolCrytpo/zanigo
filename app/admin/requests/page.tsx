import { requireSession } from '@/lib/auth/session'
import { getListingRequests } from '@/lib/ingestion/queries'
import Link from 'next/link'
import type { ListingRequest } from '@/lib/ingestion/types'

const STATUS_LABEL: Record<string, string> = {
  new: 'Nouvelle', under_review: 'En cours', need_more_info: 'Info manquante',
  accepted: 'Acceptée', rejected: 'Rejetée', applied: 'Appliquée', closed: 'Fermée',
}
const STATUS_COLOR: Record<string, string> = {
  new: '#dc2626', under_review: '#2563eb', need_more_info: '#d97706',
  accepted: '#16a34a', rejected: '#6b7280', applied: '#059669', closed: '#9ca3af',
}
const TYPE_LABEL: Record<string, string> = {
  correction: '✏️ Correction', removal: '🗑️ Retrait', objection: '⚠️ Opposition', other: '💬 Autre',
}

interface PageProps {
  searchParams: Promise<{ status?: string; type?: string; page?: string }>
}

export default async function RequestsPage({ searchParams }: PageProps) {
  await requireSession()
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))

  let result = { items: [] as ListingRequest[], total: 0 }
  try {
    result = await getListingRequests({ status: sp.status, type: sp.type, page })
  } catch { /* DB */ }

  const totalPages = Math.ceil(result.total / 30)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
          Demandes de correction / retrait <span className="text-sm font-normal text-gray-400">({result.total})</span>
        </h1>
      </div>

      <form method="GET" className="flex flex-wrap gap-2 mb-5">
        <select name="status" defaultValue={sp.status ?? ''}
          className="border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none"
          style={{ borderColor: '#e2e8f0' }}>
          <option value="">Tous statuts</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="type" defaultValue={sp.type ?? ''}
          className="border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none"
          style={{ borderColor: '#e2e8f0' }}>
          <option value="">Tous types</option>
          {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button type="submit" className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#374151' }}>Filtrer</button>
      </form>

      {result.items.length === 0 ? (
        <div className="card p-6 text-center text-sm text-gray-400">Aucune demande</div>
      ) : (
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#e2e8f0' }}>
                {['Type','Fiche','Demandeur','Motif','Statut','Date','Action'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.items.map(req => (
                <tr key={req.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#f1f5f9' }}>
                  <td className="py-2 px-3 text-xs">{TYPE_LABEL[req.request_type] ?? req.request_type}</td>
                  <td className="py-2 px-3 text-xs text-gray-500">
                    {req.listing_slug ? (
                      <a href={`/lieux/${req.listing_slug}`} target="_blank" className="hover:underline">
                        {req.listing_slug}
                      </a>
                    ) : '—'}
                  </td>
                  <td className="py-2 px-3 text-xs" style={{ color: 'var(--color-basalte)' }}>
                    {req.requester_name}
                    <div className="text-gray-400">{req.requester_role ?? ''}</div>
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-500 max-w-xs truncate">{req.request_reason ?? '—'}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{ background: STATUS_COLOR[req.status] ?? '#6b7280' }}>
                      {STATUS_LABEL[req.status] ?? req.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-400">
                    {new Date(req.received_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-2 px-3">
                    <Link href={`/admin/requests/${req.id}`}
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{ background: '#f1f5f9', color: '#374151' }}>
                      Traiter
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
            if (sp.status) params.set('status', sp.status)
            if (sp.type) params.set('type', sp.type)
            params.set('page', String(p))
            return (
              <a key={p} href={`/admin/requests?${params}`}
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
