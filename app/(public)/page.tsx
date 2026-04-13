import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getPublishedListings } from '@/lib/db/queries'
import { ListingCard } from '@/components/listings/ListingCard'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import pool from '@/lib/db/client'

export const metadata: Metadata = {
  title: 'Zanimo Guide — Le guide péi des lieux pensés pour les animaux',
}

const HOW_IT_WORKS = [
  { step: '1', text: 'Lieux vérifiés', sub: 'Chaque adresse est contrôlée avant publication' },
  { step: '2', text: 'Infos complètes', sub: 'Politique animaux, conditions, contacts' },
  { step: '3', text: 'Ton retour compte', sub: 'Réactions, expériences, signalements' },
  { step: '4', text: 'Tu proposes', sub: 'Chaque suggestion est vérifiée avant mise en ligne' },
]

async function getPublicStats() {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE dog_policy_status = 'allowed' AND is_published) AS adapted,
        COUNT(*) FILTER (WHERE is_published) AS total,
        COUNT(DISTINCT commune_id) FILTER (WHERE is_published) AS communes
      FROM listings
    `)
    return {
      adapted: parseInt(result.rows[0].adapted) || 0,
      total:   parseInt(result.rows[0].total)   || 0,
      communes: parseInt(result.rows[0].communes) || 0,
    }
  } catch { return { adapted: 0, total: 0, communes: 0 } }
}

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getPublishedListings>>['items'] = []
  try {
    const result = await getPublishedListings({ page: 1, per_page: 12 })
    featured = result.items.filter(l => l.is_featured)
  } catch { /* DB not ready */ }

  const stats = await getPublicStats()

  return (
    <>
      {/* ── HERO ── */}
      <section
        className="section"
        style={{
          background: 'var(--color-canvas)',
          paddingBottom: '1.5rem',
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-border) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="text-display mb-3" style={{ color: 'var(--color-text)' }}>
              Sors avec ton animal.{' '}
              <span
                style={{
                  color: 'var(--color-blue)',
                  borderBottom: '3px solid var(--color-vert)',
                  paddingBottom: '1px',
                }}
              >
                Sans te prendre la tête.
              </span>
            </h1>
            <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Restaurants, balades, hébergements et services pour profiter de La Réunion avec ton animal.
            </p>
          </div>
        </div>
      </section>

      {/* ── CARROUSEL À LA UNE ── */}
      {featured.length > 0 && (
        <section style={{ background: 'var(--color-canvas)', paddingBottom: '2rem' }}>
          <div className="container">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                À la une
              </h2>
              <Link href="/a-la-une" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-blue)' }}>
                Voir tout <ChevronRight size={13} />
              </Link>
            </div>
            <div
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featured.map(listing => (
                <div key={listing.id} style={{ scrollSnapAlign: 'start', flexShrink: 0, width: 'clamp(240px, 70vw, 300px)' }}>
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CATÉGORIES — vignette style ── */}
      <section style={{ background: 'var(--color-canvas)', paddingBottom: '2.5rem' }}>
        <div className="container">
          <CategoryGrid />
        </div>
      </section>

      {/* ── STATS ── */}
      {stats.total > 0 && (
        <section style={{ background: 'var(--color-canvas)', paddingBottom: '2.5rem' }}>
          <div className="container">
            <div
              className="max-w-xl mx-auto rounded-2xl overflow-hidden"
              style={{ border: '1px solid var(--color-border)', background: 'linear-gradient(135deg, #f8faf9 0%, #f0f8f4 100%)' }}
            >
              <div className="grid grid-cols-3">
                {[
                  {
                    value: stats.adapted > 0 ? `+${stats.adapted}` : '—',
                    label: 'Lieux adaptés',
                    color: '#1FA97E',
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1FA97E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    ),
                  },
                  {
                    value: stats.total > 0 ? `+${stats.total}` : '—',
                    label: 'Adresses',
                    color: '#2A74E6',
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A74E6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                    ),
                  },
                  {
                    value: stats.communes > 0 ? String(stats.communes) : '—',
                    label: 'Communes',
                    color: '#1A2030',
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A2030" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                      </svg>
                    ),
                  },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className="flex flex-col items-center justify-center py-5 px-3 text-center"
                    style={{ borderRight: i < 2 ? '1px solid var(--color-border)' : undefined }}
                  >
                    <div className="mb-2 opacity-70">{s.icon}</div>
                    <p className="text-2xl font-bold leading-none mb-1" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>
                      {s.value}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-2.5 text-center" style={{ borderTop: '1px solid var(--color-border)', background: 'rgba(31,169,126,0.04)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--color-vert)' }}>
                  Grandit chaque semaine — <Link href="/ajouter-lieu" style={{ textDecoration: 'underline', color: 'var(--color-vert)' }}>Propose un lieu</Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="section" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <h2 className="text-h2 mb-8 text-center" style={{ color: 'var(--color-text)' }}>
            Comment ça marche ?
          </h2>

          {/* Desktop: horizontal with connecting line */}
          <div className="hidden md:flex items-start max-w-3xl mx-auto relative">
            {/* Connecting line */}
            <div
              className="absolute top-5 left-0 right-0"
              style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--color-border) 10%, var(--color-border) 90%, transparent)', zIndex: 0 }}
            />
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} className="flex-1 flex flex-col items-center text-center px-4 relative z-10">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-3"
                  style={{ background: 'var(--color-vert)', color: '#fff', fontFamily: 'var(--font-display)', boxShadow: '0 0 0 4px var(--color-surface)' }}
                >
                  {s.step}
                </div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                  {s.text}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile: 2×2 grid */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto md:hidden">
            {HOW_IT_WORKS.map(s => (
              <div key={s.step} className="flex flex-col items-center text-center gap-2 p-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: 'var(--color-vert)', color: '#fff', fontFamily: 'var(--font-display)' }}
                >
                  {s.step}
                </div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                  {s.text}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
