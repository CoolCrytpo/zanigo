import { requireSession } from '@/lib/auth/session'
import pool from '@/lib/db/client'
import { Calendar, Plus } from 'lucide-react'

async function getEvents() {
  try {
    const result = await pool.query(`
      SELECT id, title, is_active, created_at,
             target->>'event_date' AS event_date,
             target->>'event_end_date' AS event_end_date,
             target->>'location' AS location,
             cta_url
      FROM campaigns
      WHERE type = 'event'
      ORDER BY created_at DESC
    `)
    return result.rows
  } catch {
    return []
  }
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default async function EventsPage() {
  await requireSession()
  const events = await getEvents()

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Calendar size={20} style={{ color: 'var(--color-basalte)' }} />
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
          Événements
        </h1>
      </div>

      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-basalte)' }}>
          Événements ({events.length})
        </h2>
        {events.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: '#9ca3af' }}>Aucun événement créé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {['Titre', 'Date', 'Lieu', 'Actif', 'Actions'].map(h => (
                    <th key={h} className="text-left pb-2 pr-4 font-medium" style={{ color: '#6b7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((e: any) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td className="py-2 pr-4 font-medium" style={{ color: '#111827' }}>{e.title}</td>
                    <td className="py-2 pr-4 text-xs" style={{ color: '#374151' }}>
                      {formatDate(e.event_date)}
                      {e.event_end_date ? ` → ${formatDate(e.event_end_date)}` : ''}
                    </td>
                    <td className="py-2 pr-4 text-xs" style={{ color: '#6b7280' }}>{e.location || '—'}</td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ background: e.is_active ? '#16a34a' : '#6b7280' }}>
                        {e.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-2 flex items-center gap-3">
                      {e.cta_url && (
                        <a href={e.cta_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs underline" style={{ color: '#2563eb' }}>
                          Ouvrir
                        </a>
                      )}
                      <form method="POST" action={`/api/admin/events?id=${e.id}&toggle=1`}>
                        <button type="submit" className="text-xs underline" style={{ color: e.is_active ? '#dc2626' : '#16a34a' }}>
                          {e.is_active ? 'Désactiver' : 'Activer'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create form */}
      <details className="card p-5">
        <summary className="cursor-pointer font-semibold text-sm flex items-center gap-2 select-none"
          style={{ color: 'var(--color-basalte)' }}>
          <Plus size={15} /> Créer un événement
        </summary>
        <form method="POST" action="/api/admin/events" className="mt-4 grid grid-cols-1 gap-3">
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: '#374151' }}>
              Titre *
              <input name="title" required placeholder="Fête des chiens 2026"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#e2e8f0' }} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: '#374151' }}>
              Annonceur
              <input name="advertiser" defaultValue="Zanimo Guide" placeholder="Zanimo Guide"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#e2e8f0' }} />
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: '#374151' }}>
              Image (URL)
              <input name="asset_url" type="url" placeholder="https://…"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#e2e8f0' }} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: '#374151' }}>
              Lien de l'événement (URL)
              <input name="cta_url" type="url" placeholder="https://…"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#e2e8f0' }} />
            </label>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: '#374151' }}>
              Date de début
              <input name="event_date" type="date"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#e2e8f0' }} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: '#374151' }}>
              Date de fin (optionnel)
              <input name="event_end_date" type="date"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#e2e8f0' }} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: '#374151' }}>
              Lieu (optionnel)
              <input name="location" placeholder="Saint-Denis, Réunion"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#e2e8f0' }} />
            </label>
          </div>
          <div>
            <button type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'var(--color-vert)' }}>
              Créer l'événement
            </button>
          </div>
        </form>
      </details>
    </div>
  )
}
