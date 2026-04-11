import { requireSession } from '@/lib/auth/session'
import { getStagingListings } from '@/lib/ingestion/queries'
import { StagingBulkActions } from '@/components/admin/StagingBulkActions'
import Link from 'next/link'
import type { StagingListing } from '@/lib/ingestion/types'

const STATUS_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'to_review', label: 'À revoir' },
  { value: 'duplicate_suspected', label: 'Doublons suspects' },
  { value: 'approved', label: 'Approuvés' },
  { value: 'rejected', label: 'Rejetés' },
  { value: 'published', label: 'Publiés' },
]

interface PageProps {
  searchParams: Promise<{ status?: string; batch_id?: string; q?: string; page?: string }>
}

export default async function StagingPage({ searchParams }: PageProps) {
  await requireSession()
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))

  let result = { items: [] as StagingListing[], total: 0 }
  try {
    result = await getStagingListings({
      status: sp.status, batch_id: sp.batch_id, q: sp.q,
      page, per_page: 30,
    })
  } catch { /* DB */ }

  const totalPages = Math.ceil(result.total / 30)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
          Zone de staging <span className="text-sm font-normal text-gray-400">({result.total})</span>
        </h1>
        <Link href="/admin/import" className="text-sm px-3 py-1.5 rounded-lg border" style={{ borderColor: '#e2e8f0', color: '#374151' }}>
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
          Aucune pré-fiche. <Link href="/admin/import" className="underline">Lancer un import</Link>
        </div>
      ) : (
        <StagingBulkActions items={result.items} basePath="/admin/staging" />
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
