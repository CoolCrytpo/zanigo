import { requireSession } from '@/lib/auth/session'
import pool from '@/lib/db/client'

async function getDashboardStats() {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE is_published) AS published,
        COUNT(*) FILTER (WHERE verification_status = 'pending_review') AS pending,
        COUNT(*) FILTER (WHERE verification_status = 'needs_recheck') AS recheck,
        COUNT(*) AS total
      FROM listings
    `)
    const contribs = await pool.query(
      `SELECT COUNT(*) AS pending FROM contributions WHERE status = 'pending'`
    )
    const campaigns = await pool.query(
      `SELECT COUNT(*) AS active FROM campaigns WHERE is_active = true`
    )
    return {
      ...result.rows[0],
      contributions_pending: contribs.rows[0].pending,
      campaigns_active: campaigns.rows[0].active,
    }
  } catch {
    return { published: 0, pending: 0, recheck: 0, total: 0, contributions_pending: 0, campaigns_active: 0 }
  }
}

export default async function AdminDashboard() {
  await requireSession()
  const stats = await getDashboardStats()

  const STATS = [
    { label: 'Fiches publiées',     value: stats.published,              color: '#16a34a' },
    { label: 'En attente',          value: stats.pending,                color: '#d97706' },
    { label: 'À revérifier',        value: stats.recheck,                color: '#f97316' },
    { label: 'Total fiches',        value: stats.total,                  color: '#6b7280' },
    { label: 'Contributions',       value: stats.contributions_pending,  color: '#7c3aed' },
    { label: 'Campagnes actives',   value: stats.campaigns_active,       color: 'var(--color-lagon)' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
        Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-5" style={{ borderColor: '#e2e8f0' }}>
            <p className="text-2xl font-bold mb-1" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>
              {s.value}
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#e2e8f0' }}>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--color-basalte)' }}>Actions rapides</h2>
          <div className="flex flex-col gap-2">
            <a href="/admin/listings/new" className="text-sm text-green-700 hover:underline">+ Nouvelle fiche</a>
            <a href="/admin/moderation" className="text-sm text-amber-700 hover:underline">Traiter les contributions</a>
            <a href="/admin/sponsors" className="text-sm text-blue-700 hover:underline">Gérer les campagnes</a>
          </div>
        </div>
      </div>
    </div>
  )
}
