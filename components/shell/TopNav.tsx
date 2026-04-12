'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Sparkles, Compass, MapPin, Stethoscope } from 'lucide-react'

// Inline ZG logo icon SVG
function ZGIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#2A74E6"/>
      <path d="M 8.5 10 L 23.5 10 L 8.5 22 L 23.5 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="25" cy="9" r="3.5" fill="#1FA97E"/>
    </svg>
  )
}

const ACTION_LINKS = [
  { href: '/explorer',          label: 'Explorer le guide',    Icon: Compass,      style: 'outline' },
  { href: '/ajouter-lieu',      label: 'Ajouter un lieu',      Icon: MapPin,       style: 'primary' },
  { href: '/proposer-service',  label: 'Proposer un service',  Icon: Stethoscope,  style: 'secondary' },
] as const

export function TopNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="sticky top-0 z-50"
      style={{
        background: scrolled ? 'rgba(247,245,239,0.97)' : 'var(--color-canvas)',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'all 200ms ease',
      }}>
      <div className="container">
        <div className="flex items-center justify-between h-14 gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" style={{ textDecoration: 'none' }}>
            <ZGIcon size={28} />
            <div className="flex flex-col">
              <span className="font-black text-base leading-none" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                <span style={{ color: '#2A74E6' }}>Zanimo</span>
                <span style={{ color: '#1FA97E' }}> Guide</span>
              </span>
              <span className="hidden sm:block text-xs leading-none mt-0.5" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)' }}>
                Le guide péi des lieux pensés pour les animaux
              </span>
            </div>
          </Link>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* À la une — VIP style */}
            <Link href="/a-la-une"
              className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl transition-all"
              style={{
                background: isActive('/a-la-une') ? '#d97706' : '#F4B73F',
                color: '#1A2030',
              }}>
              <Sparkles size={13} strokeWidth={2.5} />
              À la une
            </Link>

            <div className="w-px h-5 mx-1" style={{ background: 'var(--color-border)' }} />

            {/* 3 action buttons */}
            {ACTION_LINKS.map(({ href, label, Icon, style }) => {
              const active = isActive(href)
              const bg = active
                ? (style === 'primary' ? '#1A5CC8' : style === 'secondary' ? '#178060' : 'var(--color-blue-light)')
                : (style === 'primary' ? '#2A74E6' : style === 'secondary' ? '#1FA97E' : '#fff')
              const color = active
                ? (style === 'outline' ? '#2A74E6' : '#fff')
                : (style === 'outline' ? 'var(--color-text-secondary)' : '#fff')
              const border = style === 'outline' ? `1px solid ${active ? '#2A74E6' : 'var(--color-border)'}` : 'none'
              return (
                <Link key={href} href={href}
                  className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all"
                  style={{ background: bg, color, border }}>
                  <Icon size={13} strokeWidth={2.25} />
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Tablet: actions condensées + hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tablet only: show À la une + Ajouter (hidden on lg) */}
            <Link href="/a-la-une"
              className="hidden md:flex lg:hidden items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl"
              style={{ background: '#F4B73F', color: '#1A2030' }}>
              <Sparkles size={12} />
              À la une
            </Link>
            <Link href="/ajouter-lieu"
              className="hidden md:flex lg:hidden items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl text-white"
              style={{ background: '#2A74E6' }}>
              <MapPin size={12} />
              Ajouter
            </Link>

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(v => !v)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl"
              style={{ color: 'var(--color-text)', background: menuOpen ? 'var(--color-border)' : 'transparent' }}
              aria-label={menuOpen ? 'Fermer' : 'Menu'} aria-expanded={menuOpen}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-canvas)' }}>
          <nav className="container py-3 flex flex-col gap-2">
            {/* VIP À la une */}
            <Link href="/a-la-une"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: '#FFF8E6', color: '#92400e' }}>
              <Sparkles size={15} style={{ color: '#F4B73F' }} />
              À la une — Sélection
            </Link>

            <div className="h-px my-1" style={{ background: 'var(--color-border)' }} />

            {ACTION_LINKS.map(({ href, label, Icon, style }) => (
              <Link key={href} href={href}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: style === 'primary' ? '#2A74E6' : style === 'secondary' ? '#1FA97E' : '#1A2030' }}>
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
