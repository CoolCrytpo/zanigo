import { requireSession } from '@/lib/auth/session'
import { getAdminListings } from '@/lib/db/queries'
import { AdminListingsTable } from '@/components/admin/AdminListingsTable'
import Link from 'next/link'

const STATUS_OPTIONS = [
  { value: '',               label: 'Tous statuts' },
  { value: 'published',      label: 'Publiés' },
  { value: 'draft',          label: 'Brouillons' },
  { value: 'pending_review', label: 'En attente' },
  { value: 'needs_recheck',  label: 'À revérifier' },
  { value: 'conflict',       label: 'Conflits' },
  { value: 'archived',       label: 'Archivés' },
]

const TYPE_OPTIONS = [
  { value: '',        label: 'Tous types' },
  { value: 'place',   label: 'Lieux' },
  { value: 'spot',    label: 'Spots' },
  { value: 'walk',    label: 'Balades' },
  { value: 'service', label: 'Services' },
]

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; type?: string; page?: string }>
}

export default async function AdminListingsPage({ searchParams }: PageProps) {
  await requireSession()
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))

  let result = { items: [] as Awaited<ReturnType<typeof getAdminListings>>['items'], total: 0, page: 1, per_page: 30 }
  try {
    result = await getAdminListings({ q: sp.q, status: sp.status, type: sp.type, page, per_page: 30 })
  } catch { /* DB */ }

  const totalPages = Math.ceil(result.total / result.per_page)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
          Fiches <span className="text-sm font-normal text-gray-400">({result.total})</span>
        </h1>
        <Link
          href="/admin/listings/new"
          className="text-sm font-semibold px-3 py-1.5 rounded-lg text-white"
          style={{ background: 'var(--color-vert)' }}
        >
          + Nouvelle fiche
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-2 mb-5">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Rechercher…"
          className="flex-1 min-w-32 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: '#e2e8f0' }}
        />
        <select
          name="status"
          defaultValue={sp.status ?? ''}
          className="border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none"
          style={{ borderColor: '#e2e8f0' }}
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          name="type"
          defaultValue={sp.type ?? ''}
          className="border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none"
          style={{ borderColor: '#e2e8f0' }}
        >
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          type="submit"
          className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#374151' }}
        >
          Filtrer
        </button>
      </form>

      <AdminListingsTable listings={result.items} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams()
            if (sp.q) params.set('q', sp.q)
            if (sp.status) params.set('status', sp.status)
            if (sp.type) params.set('type', sp.type)
            params.set('page', String(p))
            return (
              <a
                key={p}
                href={`/admin/listings?${params}`}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{
                  background: p === page ? 'var(--color-vert)' : '#f1f5f9',
                  color: p === page ? '#fff' : '#374151',
                }}
              >
                {p}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
