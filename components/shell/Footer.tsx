'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, ChevronDown } from 'lucide-react'

const APP_NAME = 'Zanimo Guide'
const APP_TAGLINE = "L'annuaire péi pour son animal"
const APP_EMAIL = 'contact@zanimo-guide.re'
const FB_URL = 'https://www.facebook.com/zanimo.guide'

const FOOTER_SECTIONS = [
  {
    title: 'Découvrir',
    links: [
      { href: '/explorer',     label: 'Explorer' },
      { href: '/a-la-une',     label: 'À la une' },
      { href: '/restaurants',  label: 'Restaurants & bars' },
      { href: '/hebergements', label: 'Hébergements' },
      { href: '/balades',      label: 'Balades & spots' },
      { href: '/services',     label: 'Services' },
    ],
  },
  {
    title: 'Proposer / Corriger',
    links: [
      { href: '/contribuer',   label: 'Proposer un lieu' },
      { href: '/signaler',     label: 'Corriger / Signaler' },
      { href: '/signaler',     label: 'Demander le retrait' },
      { href: '/methodologie', label: 'Notre méthode' },
    ],
  },
  {
    title: 'Partenaires',
    links: [
      { href: '/pro',          label: 'Espace pro' },
      { href: '/pro/sponsor',  label: 'Devenir partenaire' },
      { href: '/partenaires',  label: 'Partenaires' },
    ],
  },
  {
    title: 'Infos',
    links: [
      { href: '/contact', label: 'Contact' },
      { href: '/legal',   label: 'Mentions légales' },
      { href: '/privacy', label: 'Confidentialité' },
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()
  const [open, setOpen] = useState<string | null>(null)
  const toggle = (t: string) => setOpen(o => o === t ? null : t)

  return (
    <footer style={{ background: '#1A2030', color: '#fff' }}>
      <div className="container" style={{ paddingBlock: '3rem' }}>
        {/* Brand row */}
        <div className="mb-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-black text-lg mb-1" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                <span style={{ color: '#2A74E6' }}>Zanimo</span>
                <span style={{ color: '#1FA97E' }}> Guide</span>
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{APP_TAGLINE}</p>
            </div>
            <div className="flex items-center gap-4">
              <a href={`mailto:${APP_EMAIL}`}
                className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
                style={{ color: 'rgba(255,255,255,0.45)' }}>
                <Mail size={14} />{APP_EMAIL}
              </a>
              <a href={FB_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
                style={{ color: 'rgba(255,255,255,0.45)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Links grid — desktop */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 mb-8">
          {FOOTER_SECTIONS.map(section => (
            <div key={section.title}>
              <p className="text-xs font-bold mb-3 uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                {section.title}
              </p>
              <ul className="flex flex-col gap-1.5">
                {section.links.map(link => (
                  <li key={link.href + link.label}>
                    <Link href={link.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Links accordéon — mobile */}
        <div className="md:hidden flex flex-col mb-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {FOOTER_SECTIONS.map(section => (
            <div key={section.title} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => toggle(section.title)}
                className="w-full flex items-center justify-between py-3 text-sm font-semibold text-left"
                style={{ color: 'rgba(255,255,255,0.7)' }}>
                {section.title}
                <ChevronDown size={14}
                  style={{ transform: open === section.title ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} />
              </button>
              {open === section.title && (
                <ul className="pb-3 flex flex-col gap-2 pl-1">
                  {section.links.map(link => (
                    <li key={link.href + link.label}>
                      <Link href={link.href}
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
          &copy; {year} {APP_NAME} — La Réunion
        </p>
      </div>
    </footer>
  )
}
