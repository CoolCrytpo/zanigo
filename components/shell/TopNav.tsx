'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS } from '@/config/constants'
import { Menu, X, PlusCircle, Search } from 'lucide-react'

export function TopNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: scrolled ? 'rgba(247,245,239,0.96)' : 'var(--color-canvas)',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'all 200ms ease',
      }}
    >
      <div className="container">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo wordmark */}
          <Link
            href="/"
            className="flex items-center gap-0 font-black text-lg shrink-0"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1 }}
          >
            <span style={{ color: 'var(--color-blue)' }}>Zanimo</span>
            <span style={{ color: 'var(--color-green)' }}> Guide</span>
          </Link>

          {/* Search — desktop only */}
          <Link
            href="/explorer"
            className="hidden lg:flex items-center gap-2 flex-1 max-w-xs px-3 py-2 rounded-xl text-sm"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            <Search size={14} strokeWidth={2} />
            <span>Chercher un lieu…</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  color: isActive(link.href) ? 'var(--color-blue)' : 'var(--color-text-secondary)',
                  background: isActive(link.href) ? 'var(--color-blue-light)' : 'transparent',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/contribuer"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-all duration-150"
              style={{ background: 'var(--color-blue)', color: '#fff' }}
            >
              <PlusCircle size={14} strokeWidth={2.5} />
              Proposer un lieu
            </Link>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl"
              style={{
                color: 'var(--color-text)',
                background: menuOpen ? 'var(--color-border)' : 'transparent',
              }}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-canvas)' }}
        >
          <nav className="container py-3 flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  color: isActive(link.href) ? 'var(--color-blue)' : 'var(--color-text)',
                  background: isActive(link.href) ? 'var(--color-blue-light)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contribuer"
              className="mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--color-blue)', color: '#fff' }}
            >
              <PlusCircle size={14} strokeWidth={2.5} />
              Proposer un lieu
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
