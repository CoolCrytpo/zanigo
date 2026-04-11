import { requireSession } from '@/lib/auth/session'
import pool from '@/lib/db/client'
import Link from 'next/link'

async function getDashboardStats() {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE is_published) AS published,
        COUNT(*) FILTER (WHERE verification_status = 'pending_review') AS pending,
        COUNT(*) FILTER (WHERE verification_status = 'needs_recheck') AS recheck,
        COUNT(*) FILTER (WHERE dog_policy_status = 'unknown' AND is_published) AS unknown_policy,
        COUNT(*) AS total
      FROM listings
    `)
    const contribs = await pool.query(
      `SELECT COUNT(*) AS pending FROM contributions WHERE status = 'pending'`
    )
    const campaigns = await pool.query(
      `SELECT COUNT(*) AS active FROM campaigns WHERE is_active = true`
    )
    const staging = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'to_review') AS to_review,
        COUNT(*) FILTER (WHERE status = 'duplicate_suspected') AS duplicates,
        COUNT(*) AS total
       FROM staging_listings`
    )
    const requests = await pool.query(
      `SELECT COUNT(*) AS new_requests FROM listing_requests WHERE status = 'new'`
    )
    return {
      ...result.rows[0],
      contributions_pending: contribs.rows[0].pending,
      campaigns_active: campaigns.rows[0].active,
      staging_to_review: staging.rows[0].to_review,
      staging_duplicates: staging.rows[0].duplicates,
      staging_total: staging.rows[0].total,
      new_requests: requests.rows[0].new_requests,
    }
  } catch {
    return {
      published: 0, pending: 0, recheck: 0, total: 0, unknown_policy: 0,
      contributions_pending: 0, campaigns_active: 0,
      staging_to_review: 0, staging_duplicates: 0, staging_total: 0, new_requests: 0,
    }
  }
}

export default async function AdminDashboard() {
  await requireSession()
  const s = await getDashboardStats()

  return (
    <div>
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
        Dashboard
      </h1>

      {/* Annuaire */}
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Annuaire</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Fiches publiées', value: s.published, color: '#16a34a', href: '/admin/listings?status=published' },
          { label: 'En attente review', value: s.pending, color: '#d97706', href: '/admin/listings?status=pending_review' },
          { label: 'À revérifier', value: s.recheck, color: '#f97316', href: '/admin/listings?status=needs_recheck' },
          { label: 'Total fiches', value: s.total, color: '#6b7280', href: '/admin/listings' },
        ].map(stat => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow" style={{ borderColor: '#e2e8f0' }}>
            <p className="text-2xl font-bold mb-0.5" style={{ color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</p>
            <p className="text-xs" style={{ color: '#6b7280' }}>{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Enrichissement */}
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Enrichissement à faire</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Policy chien inconnue', value: s.unknown_policy, color: '#7c3aed', href: '/admin/listings?policy=unknown', badge: s.unknown_policy > 0 },
          { label: 'Staging à revoir', value: s.staging_to_review, color: '#2563eb', href: '/admin/staging?status=to_review', badge: s.staging_to_review > 0 },
          { label: 'Doublons suspects', value: s.staging_duplicates, color: '#d97706', href: '/admin/staging?status=duplicate_suspected', badge: s.staging_duplicates > 0 },
          { label: 'Demandes nouvelles', value: s.new_requests, color: '#dc2626', href: '/admin/requests?status=new', badge: s.new_requests > 0 },
        ].map(stat => (
          <Link key={stat.label} href={stat.href}
            className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow relative"
            style={{ borderColor: stat.badge ? '#fde68a' : '#e2e8f0', background: stat.badge ? '#fffbeb' : '#fff' }}>
            <p className="text-2xl font-bold mb-0.5" style={{ color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</p>
            <p className="text-xs" style={{ color: '#6b7280' }}>{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#e2e8f0' }}>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--color-basalte)' }}>Actions rapides</h2>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/admin/listings/new" className="text-green-700 hover:underline">+ Nouvelle fiche manuelle</Link>
            <Link href="/admin/import/urls" className="text-blue-700 hover:underline">↗ Importer par URLs</Link>
            <Link href="/admin/import/csv" className="text-blue-700 hover:underline">↗ Importer un CSV</Link>
            <Link href="/admin/staging" className="text-purple-700 hover:underline">📋 Revoir le staging ({s.staging_total} fiches)</Link>
            <Link href="/admin/requests" className="text-red-700 hover:underline">📬 Demandes de correction/retrait</Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#e2e8f0' }}>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--color-basalte)' }}>Workflow import</h2>
          <ol className="flex flex-col gap-2 text-sm text-gray-500">
            {[
              'Importer les établissements (nom, tél, commune)',
              'Revoir et approuver en staging',
              'Enrichir la policy chien au fil du temps',
              'Publier quand la fiche est complète',
            ].map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 text-white"
                  style={{ background: 'var(--color-vert)' }}>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
