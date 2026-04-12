import type { Metadata } from 'next'
import Link from 'next/link'
import { UtensilsCrossed, BedDouble, TreePine, Stethoscope, BadgeCheck, ChevronRight } from 'lucide-react'
import { getPublishedListings } from '@/lib/db/queries'
import { ListingCard } from '@/components/listings/ListingCard'
import pool from '@/lib/db/client'

export const metadata: Metadata = {
  title: "Zanimo Guide — Le guide péi des lieux pensés pour les animaux",
}

const CATEGORIES = [
  { href: '/restaurants',  label: 'Restaurants & bars',  desc: 'Terrasses et cafés ouverts aux animaux',        Icon: UtensilsCrossed, color: '#FF6B57', bg: '#FFF3F1' },
  { href: '/hebergements', label: 'Hébergements',         desc: 'Hôtels, gîtes, campings, locations',            Icon: BedDouble,       color: '#2A74E6', bg: '#EEF4FF' },
  { href: '/balades',      label: 'Balades & spots',      desc: 'Sentiers, plages, parcs, nature',               Icon: TreePine,        color: '#1FA97E', bg: '#EDFBF5' },
  { href: '/services',     label: 'Services',             desc: 'Vétérinaires, toiletteurs, pensions',           Icon: Stethoscope,     color: '#8B5CF6', bg: '#F3EEFF' },
  { href: '/pro',          label: 'Espace pro',           desc: 'Établissements engagés & partenariats',         Icon: BadgeCheck,      color: '#37C8C0', bg: '#EDFBFA' },
] as const

const HOW_IT_WORKS = [
  { step: '1', text: 'Des lieux pensés pour les animaux. Vérifiés.' },
  { step: '2', text: 'Infos pratiques : accueil des animaux, conditions, contacts' },
  { step: '3', text: 'Partage ton expérience ou signale une erreur' },
  { step: '4', text: 'Propose un lieu ou un service, chaque suggestion est vérifiée avant publication' },
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
      total: parseInt(result.rows[0].total) || 0,
      communes: parseInt(result.rows[0].communes) || 0,
    }
  } catch { return { adapted: 0, total: 0, communes: 0 } }
}

export default async function HomePage() {
  // Load featured listings for carousel
  let featured: Awaited<ReturnType<typeof getPublishedListings>>['items'] = []
  try {
    const result = await getPublishedListings({ page: 1, per_page: 12 })
    featured = result.items.filter(l => l.is_featured)
  } catch { /* DB not ready */ }

  const stats = await getPublicStats()

  return (
    <>
      {/* ── HERO ── */}
      <section className="section" style={{ background: 'var(--color-canvas)', paddingBottom: '1.5rem' }}>
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="text-display mb-3" style={{ color: 'var(--color-text)' }}>
              Sors avec ton animal.{' '}
              <span style={{ color: 'var(--color-blue)' }}>Sans te prendre la tête.</span>
            </h1>
            <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Restaurants, balades, hébergements et services pour profiter de La Réunion avec ton animal.
            </p>
          </div>
        </div>
      </section>

      {/* ── CARROUSEL À LA UNE (only if featured items exist) ── */}
      {featured.length > 0 && (
        <section style={{ background: 'var(--color-canvas)', paddingBottom: '2rem' }}>
          <div className="container">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)' }}>
                À la une
              </h2>
              <Link href="/a-la-une"
                className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: 'var(--color-blue)' }}>
                Voir tout <ChevronRight size={13} />
              </Link>
            </div>
            {/* Horizontal scroll carousel */}
            <div
              className="flex gap-3 overflow-x-auto pb-2"
              style={{
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {featured.map(listing => (
                <div key={listing.id}
                  style={{
                    scrollSnapAlign: 'start',
                    flexShrink: 0,
                    width: 'clamp(240px, 70vw, 300px)',
                  }}>
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CATÉGORIES ── */}
      <section style={{ background: 'var(--color-canvas)', paddingBottom: '3rem' }}>
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map(({ href, label, desc, Icon, color, bg }) => (
              <Link key={href} href={href}
                className="card card-hover p-4 flex flex-col gap-3 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: bg }}>
                  <Icon size={20} strokeWidth={1.75} style={{ color }} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-0.5"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                    {label}
                  </p>
                  <p className="text-caption">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      {(stats.total > 0 || stats.communes > 0) && (
        <section style={{ background: 'var(--color-canvas)', paddingBottom: '1rem' }}>
          <div className="container">
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-center">
              <div className="p-4">
                <p className="text-2xl font-bold mb-0.5" style={{ color: 'var(--color-vert)', fontFamily: 'var(--font-display)' }}>
                  {stats.adapted > 0 ? `+${stats.adapted}` : '—'}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-muted)', lineHeight: 1.4 }}>Lieux adaptés</p>
              </div>
              <div className="p-4" style={{ borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
                <p className="text-2xl font-bold mb-0.5" style={{ color: 'var(--color-blue)', fontFamily: 'var(--font-display)' }}>
                  {stats.total > 0 ? `+${stats.total}` : '—'}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-muted)', lineHeight: 1.4 }}>Adresses référencées</p>
              </div>
              <div className="p-4">
                <p className="text-2xl font-bold mb-0.5" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
                  {stats.communes > 0 ? stats.communes : '—'}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-muted)', lineHeight: 1.4 }}>Communes</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="section" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <h2 className="text-h2 mb-6 text-center" style={{ color: 'var(--color-text)' }}>
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center gap-3 p-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ background: 'var(--color-blue-light)', color: 'var(--color-blue)' }}>
                  {s.step}
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
