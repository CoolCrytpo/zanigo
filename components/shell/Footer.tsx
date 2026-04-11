import Link from 'next/link'
import { Mail } from 'lucide-react'
import { APP_NAME, APP_TAGLINE, APP_EMAIL } from '@/config/constants'

const FOOTER_LINKS = [
  {
    title: 'Découvrir',
    links: [
      { href: '/restaurants', label: 'Restaurants & bars' },
      { href: '/hebergements', label: 'Hébergements' },
      { href: '/balades', label: 'Balades & spots' },
      { href: '/services', label: 'Services' },
      { href: '/a-la-une', label: 'À la une' },
    ],
  },
  {
    title: 'Proposer / Corriger',
    links: [
      { href: '/contribuer', label: 'Proposer un lieu' },
      { href: '/contribuer', label: 'Corriger une fiche' },
      { href: '/signaler', label: 'Demander le retrait' },
      { href: '/methodologie', label: 'Notre méthode' },
    ],
  },
  {
    title: 'Partenaires',
    links: [
      { href: '/pro', label: 'Espace pro' },
      { href: '/pro/sponsor', label: 'Devenir partenaire' },
      { href: '/pro/sponsor', label: 'Offres premium' },
    ],
  },
  {
    title: 'Infos',
    links: [
      { href: '/contact', label: 'Contact' },
      { href: '/legal', label: 'Mentions légales' },
      { href: '/privacy', label: 'Confidentialité' },
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: '#1A2030', color: '#fff' }}>
      <div className="container" style={{ paddingBlock: '3rem' }}>
        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3">
              <span className="font-black text-lg" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                <span style={{ color: 'var(--color-blue)' }}>Zanimo</span>
                <span style={{ color: 'var(--color-green)' }}> Guide</span>
              </span>
            </div>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
              {APP_TAGLINE}
            </p>
            <a
              href={`mailto:${APP_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              <Mail size={13} />
              {APP_EMAIL}
            </a>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-bold mb-3 uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                {section.title}
              </p>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-5 text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
        >
          <p>&copy; {year} {APP_NAME} — La Réunion</p>
          <p style={{ color: 'rgba(255,255,255,0.35)' }}>
            Fait avec soin pour les familles et leurs animaux
          </p>
        </div>
      </div>
    </footer>
  )
}
