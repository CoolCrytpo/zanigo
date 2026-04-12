import { requireSession } from '@/lib/auth/session'
import pool from '@/lib/db/client'
import { Building2, Link as LinkIcon, Mail } from 'lucide-react'

async function getCampaigns() {
  try {
    const result = await pool.query(`
      SELECT id, title, advertiser, type, is_active, starts_at, ends_at, slug
      FROM campaigns
      WHERE type IN ('featured_listing', 'category_sponsor', 'seasonal')
      ORDER BY created_at DESC
      LIMIT 20
    `)
    return result.rows
  } catch {
    return []
  }
}

async function getProProfiles() {
  try {
    const result = await pool.query(`
      SELECT id, business_name, type, is_verified, created_at
      FROM pro_profiles
      ORDER BY created_at DESC
      LIMIT 20
    `)
    return result.rows
  } catch {
    return null
  }
}

const TYPE_LABELS: Record<string, string> = {
  featured_listing: 'Mise en avant',
  category_sponsor: 'Sponsor catégorie',
  seasonal: 'Saisonnier',
}

const TYPE_COLORS: Record<string, string> = {
  featured_listing: '#7c3aed',
  category_sponsor: '#2563eb',
  seasonal: '#d97706',
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default async function EspaceProPage() {
  await requireSession()
  const [campaigns, proProfiles] = await Promise.all([getCampaigns(), getProProfiles()])

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Building2 size={20} style={{ color: 'var(--color-basalte)' }} />
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
          Espace pro &amp; Partenariats
        </h1>
      </div>

      <div className="card p-5 mb-5 flex items-center gap-3 text-sm" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <Mail size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
        <span style={{ color: '#374151' }}>
          Nouveau partenariat —{' '}
          <a href="mailto:contact@zanimo-guide.re" className="font-medium underline" style={{ color: '#16a34a' }}>
            contact@zanimo-guide.re
          </a>
        </span>
      </div>

      {/* Campagnes pro */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-basalte)' }}>
          Campagnes pro actives
        </h2>
        {campaigns.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: '#9ca3af' }}>Aucune campagne pro.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {['Titre', 'Annonceur', 'Type', 'Actif', 'Début', 'Fin', 'Actions'].map(h => (
                    <th key={h} className="text-left pb-2 pr-4 font-medium" style={{ color: '#6b7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td className="py-2 pr-4 font-medium" style={{ color: '#111827' }}>{c.title}</td>
                    <td className="py-2 pr-4" style={{ color: '#374151' }}>{c.advertiser || '—'}</td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ background: TYPE_COLORS[c.type] ?? '#6b7280' }}>
                        {TYPE_LABELS[c.type] ?? c.type}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ background: c.is_active ? '#16a34a' : '#6b7280' }}>
                        {c.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs" style={{ color: '#6b7280' }}>{formatDate(c.starts_at)}</td>
                    <td className="py-2 pr-4 text-xs" style={{ color: '#6b7280' }}>{formatDate(c.ends_at)}</td>
                    <td className="py-2">
                      {c.slug && (
                        <a href={`/${c.slug}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs underline"
                          style={{ color: '#2563eb' }}>
                          <LinkIcon size={12} /> Ouvrir
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

      {/* Profils pro */}
      <div className="card p-5">
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-basalte)' }}>
          Profils pro
        </h2>
        {proProfiles === null ? (
          <p className="text-sm text-center py-6" style={{ color: '#9ca3af' }}>Table non disponible.</p>
        ) : proProfiles.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: '#9ca3af' }}>Aucun profil pro enregistré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {['Raison sociale', 'Type', 'Vérifié', 'Créé le'].map(h => (
                    <th key={h} className="text-left pb-2 pr-4 font-medium" style={{ color: '#6b7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proProfiles.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td className="py-2 pr-4 font-medium" style={{ color: '#111827' }}>{p.business_name}</td>
                    <td className="py-2 pr-4 text-xs" style={{ color: '#6b7280' }}>{p.type || '—'}</td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ background: p.is_verified ? '#16a34a' : '#6b7280' }}>
                        {p.is_verified ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td className="py-2 text-xs" style={{ color: '#6b7280' }}>{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
