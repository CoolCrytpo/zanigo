import { requireSession } from '@/lib/auth/session'
import pool from '@/lib/db/client'
import { Megaphone, Plus } from 'lucide-react'

async function getEncarts() {
  try {
    const result = await pool.query(`
      SELECT id, title, type, is_active, created_at,
             target->>'placement' AS placement,
             cta_url
      FROM campaigns
      WHERE type IN ('announcement', 'carousel')
      ORDER BY created_at DESC
    `)
    return result.rows
  } catch {
    return []
  }
}

const TYPE_COLORS: Record<string, string> = {
  announcement: '#2563eb',
  carousel: '#7c3aed',
}

const TYPE_LABELS: Record<string, string> = {
  announcement: 'Annonce',
  carousel: 'Carousel',
}

export default async function EncartsPage() {
  await requireSession()
  const encarts = await getEncarts()

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Megaphone size={20} style={{ color: 'var(--color-basalte)' }} />
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
          Encarts &amp; Bandeaux
        </h1>
      </div>

      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-basalte)' }}>
          Encarts ({encarts.length})
        </h2>
        {encarts.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: '#9ca3af' }}>Aucun encart créé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {['Titre', 'Type', 'Placement', 'Actif', 'Actions'].map(h => (
                    <th key={h} className="text-left pb-2 pr-4 font-medium" style={{ color: '#6b7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {encarts.map((e: any) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td className="py-2 pr-4 font-medium" style={{ color: '#111827' }}>{e.title}</td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ background: TYPE_COLORS[e.type] ?? '#6b7280' }}>
                        {TYPE_LABELS[e.type] ?? e.type}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs" style={{ color: '#6b7280' }}>{e.placement || '—'}</td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ background: e.is_active ? '#16a34a' : '#6b7280' }}>
                        {e.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-2">
                      {e.cta_url && (
                        <a href={e.cta_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs underline" style={{ color: '#2563eb' }}>
                          Ouvrir
                        </a>
                      )}
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
          <Plus size={15} /> Créer un encart
        </summary>
        <form method="POST" action="/api/admin/encarts" className="mt-4 grid grid-cols-1 gap-3">
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: '#374151' }}>
              Titre *
              <input name="title" required placeholder="Bandeau d'accueil"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#e2e8f0' }} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: '#374151' }}>
              Type
              <select name="type"
                className="border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
                style={{ borderColor: '#e2e8f0' }}>
                <option value="announcement">Annonce</option>
                <option value="carousel">Carousel</option>
              </select>
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
              Lien (URL)
              <input name="cta_url" type="url" placeholder="https://…"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#e2e8f0' }} />
            </label>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: '#374151' }}>
              Placement
              <select name="placement"
                className="border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
                style={{ borderColor: '#e2e8f0' }}>
                <option value="homepage_top">Homepage haut</option>
                <option value="explorer_top">Explorer haut</option>
                <option value="global">Global</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: '#374151' }}>
              Couleur texte (hex)
              <input name="color" placeholder="#ffffff"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#e2e8f0' }} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: '#374151' }}>
              Couleur fond (hex)
              <input name="bg" placeholder="#1a1a1a"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#e2e8f0' }} />
            </label>
          </div>
          <div>
            <button type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'var(--color-vert)' }}>
              Créer l'encart
            </button>
          </div>
        </form>
      </details>
    </div>
  )
}
