import type { Metadata } from 'next'
import Link from 'next/link'
import {
  UtensilsCrossed, BedDouble, TreePine, Stethoscope, Sparkles, BadgeCheck, ArrowRight,
} from 'lucide-react'
import { HOME_CATEGORIES } from '@/config/constants'

export const metadata: Metadata = {
  title: "Zanimo Guide — L'annuaire péi pour son animal",
}

function CategoryIcon({ name, size = 20, color }: { name: string; size?: number; color: string }) {
  const props = { size, strokeWidth: 1.75, color }
  if (name === 'UtensilsCrossed') return <UtensilsCrossed {...props} />
  if (name === 'BedDouble')       return <BedDouble {...props} />
  if (name === 'TreePine')        return <TreePine {...props} />
  if (name === 'Stethoscope')     return <Stethoscope {...props} />
  if (name === 'Sparkles')        return <Sparkles {...props} />
  if (name === 'BadgeCheck')      return <BadgeCheck {...props} />
  return null
}

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="section" style={{ background: 'var(--color-canvas)', paddingBottom: '2rem' }}>
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-overline mb-3" style={{ color: 'var(--color-green)' }}>
              L&apos;annuaire péi pour son animal
            </p>
            <h1 className="text-display mb-4" style={{ color: 'var(--color-text)' }}>
              Sors avec ton animal.{' '}
              <span style={{ color: 'var(--color-blue)' }}>Sans te prendre la tête.</span>
            </h1>
            <p className="text-body-lg mb-7" style={{ color: 'var(--color-text-secondary)' }}>
              Restaurants, hébergements, balades, spots et services —
              tout ce qu&apos;il faut pour vivre La Réunion avec ton animal.
            </p>
            <Link
              href="/explorer"
              className="btn-primary inline-flex"
            >
              Explorer l&apos;annuaire <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATÉGORIES ── */}
      <section style={{ background: 'var(--color-canvas)', paddingBlock: '1rem 3rem' }}>
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {HOME_CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="card card-hover p-4 flex flex-col gap-3 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: cat.bg }}
                >
                  <CategoryIcon name={cat.icon} size={20} color={cat.color} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                    {cat.label}
                  </p>
                  <p className="text-caption">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="section" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <h2 className="text-h2 mb-6 text-center" style={{ color: 'var(--color-text)' }}>
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { step: '1', text: 'Découvre des lieux dog-friendly vérifiés' },
              { step: '2', text: 'Consulte les infos : politique chiens, conditions, contact' },
              { step: '3', text: 'Réagis aux fiches, signale les erreurs' },
              { step: '4', text: 'Propose un lieu — on vérifie, on publie' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center gap-3 p-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ background: 'var(--color-blue-light)', color: 'var(--color-blue)' }}
                >
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

      {/* ── CTA FINAL ── */}
      <section style={{ background: 'var(--color-canvas)', paddingBlock: '2.5rem 3.5rem' }}>
        <div className="container">
          <div
            className="rounded-2xl p-7 md:p-9 flex flex-col md:flex-row items-start md:items-center gap-5"
            style={{ background: '#1A2030' }}
          >
            <div className="flex-1">
              <h2 className="text-h2 text-white mb-1.5">Tu connais un bon spot ?</h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9375rem' }}>
                Partage-le avec la communauté. On vérifie, on publie.
              </p>
            </div>
            <Link
              href="/contribuer"
              className="flex items-center gap-2 flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'var(--color-coral)' }}
            >
              Proposer un lieu
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
