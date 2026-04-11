import Link from 'next/link'
import { APP_NAME, APP_TAGLINE } from '@/config/constants'

const FOOTER_LINKS = [
  {
    title: 'Explorer',
    links: [
      { href: '/lieux', label: 'Lieux' },
      { href: '/spots', label: 'Spots' },
      { href: '/balades', label: 'Balades' },
      { href: '/services', label: 'Services' },
      { href: '/a-la-une', label: 'À la une' },
    ],
  },
  {
    title: 'ZaniGo',
    links: [
      { href: '/methodologie', label: 'Notre méthode' },
      { href: '/pro', label: 'Espace pro' },
      { href: '/pro/sponsor', label: 'Partenaires' },
      { href: '/contribuer', label: 'Contribuer' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { href: '/legal', label: 'Mentions légales' },
      { href: '/privacy', label: 'Confidentialité' },
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="mt-auto"
      style={{ background: 'var(--color-basalte)', color: '#fff' }}
    >
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
                style={{ background: 'var(--color-vert)' }}
              >
                Z
              </span>
              <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                {APP_NAME}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
              {APP_TAGLINE}
            </p>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <p
                className="text-xs font-bold mb-3 uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {section.title}
              </p>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)' }}
        >
          <p>&copy; {year} {APP_NAME} — La Réunion</p>
          <p>Fait avec ❤️ pou out' zanimaux</p>
        </div>
      </div>
    </footer>
  )
}
