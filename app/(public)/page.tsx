import type { Metadata } from 'next'
import Link from 'next/link'
import { APP_NAME, APP_TAGLINE } from '@/config/constants'

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
}

const QUICK_ENTRIES = [
  { href: '/lieux',    icon: '🏠', label: 'Où aller ?',    desc: 'Plages, restaurants, hébergements' },
  { href: '/spots',    icon: '📍', label: 'Spots',          desc: 'Parcs, points de vue, spots cachés' },
  { href: '/balades',  icon: '🥾', label: 'Balades',        desc: 'Sentiers, randonnées, nature' },
  { href: '/services', icon: '🐾', label: 'Services',       desc: 'Vétérinaires, toilettage, pension' },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--color-basalte)' }}
      >
        <div className="container py-16 md:py-24 relative z-10">
          <p
            className="text-overline mb-4"
            style={{ color: 'var(--color-vert)', fontFamily: 'var(--font-ui)' }}
          >
            Le guide péi pour bat'karé
          </p>
          <h1
            className="text-display text-white mb-5 max-w-2xl"
          >
            Sors avec ton animal.{' '}
            <span style={{ color: 'var(--color-jaune)' }}>Sans te prendre la tête.</span>
          </h1>
          <p
            className="text-body-lg mb-8 max-w-xl"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            Spots, balades, restos, hébergements, services — tout ce qu&apos;il faut pour vivre
            La Réunion avec ton animal.
          </p>

          {/* Search bar placeholder */}
          <Link
            href="/explorer"
            className="flex items-center gap-3 rounded-xl px-4 py-3 max-w-md text-sm cursor-text transition-all"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden>
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Chercher un lieu, un spot, une balade…
          </Link>
        </div>

        {/* Decorative gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 80% 50%, rgba(47,107,87,0.25) 0%, transparent 60%)',
          }}
        />
      </section>

      {/* Quick entries */}
      <section className="section" style={{ background: 'var(--color-sable)' }}>
        <div className="container">
          <h2 className="text-h2 mb-6" style={{ color: 'var(--color-basalte)' }}>
            Que cherches-tu ?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {QUICK_ENTRIES.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className="card card-hover p-5 flex flex-col gap-2"
              >
                <span className="text-2xl">{entry.icon}</span>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
                  {entry.label}
                </p>
                <p className="text-caption">{entry.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* À la une placeholder */}
      <section className="section" style={{ background: 'var(--color-vert-light)' }}>
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-h2" style={{ color: 'var(--color-basalte)' }}>
              À la une
            </h2>
            <Link
              href="/a-la-une"
              className="text-sm font-medium"
              style={{ color: 'var(--color-vert)' }}
            >
              Tout voir &rarr;
            </Link>
          </div>
          <p className="text-body" style={{ color: 'var(--color-muted)' }}>
            Les fiches mises en avant arrivent bientôt.
          </p>
        </div>
      </section>

      {/* Contribute CTA */}
      <section className="section" style={{ background: 'var(--color-sable)' }}>
        <div className="container">
          <div
            className="rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6"
            style={{ background: 'var(--color-basalte)' }}
          >
            <div className="flex-1">
              <h2 className="text-h2 text-white mb-2">
                Tu connais un bon spot ?
              </h2>
              <p className="text-body" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Partage-le avec la communauté. On vérifie, on publie.
              </p>
            </div>
            <Link
              href="/contribuer"
              className="flex-shrink-0 px-6 py-3 rounded-xl font-semibold text-white transition-all"
              style={{ background: 'var(--color-corail)' }}
            >
              Proposer un lieu
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
