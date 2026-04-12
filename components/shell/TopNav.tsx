'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, PlusCircle } from 'lucide-react'

const NAV = [
  { href: '/explorer', label: 'Explorer' },
]

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
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo + tagline */}
          <Link href="/" className="flex flex-col shrink-0" style={{ textDecoration: 'none' }}>
            <span className="font-black text-lg leading-none" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              <span style={{ color: '#2A74E6' }}>Zanimo</span>
              <span style={{ color: '#1FA97E' }}> Guide</span>
            </span>
            <span className="hidden sm:block text-xs leading-none mt-0.5" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)' }}>
              L&apos;annuaire péi pour son animal
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(link => (
              <Link key={link.href} href={link.href}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  color: isActive(link.href) ? '#2A74E6' : 'var(--color-text-secondary)',
                  background: isActive(link.href) ? 'var(--color-blue-light)' : 'transparent',
                }}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/contribuer"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-xl transition-all"
              style={{ background: '#2A74E6', color: '#fff' }}>
              <PlusCircle size={14} strokeWidth={2.5} />
              Proposer un lieu
            </Link>
            <button onClick={() => setMenuOpen(v => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl"
              style={{ color: 'var(--color-text)', background: menuOpen ? 'var(--color-border)' : 'transparent' }}
              aria-label={menuOpen ? 'Fermer' : 'Menu'} aria-expanded={menuOpen}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-canvas)' }}>
          <nav className="container py-3 flex flex-col gap-1">
            {NAV.map(link => (
              <Link key={link.href} href={link.href}
                className="px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  color: isActive(link.href) ? '#2A74E6' : 'var(--color-text)',
                  background: isActive(link.href) ? 'var(--color-blue-light)' : 'transparent',
                }}>
                {link.label}
              </Link>
            ))}
            <Link href="/contribuer"
              className="mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#2A74E6', color: '#fff' }}>
              <PlusCircle size={14} strokeWidth={2.5} />
              Proposer un lieu
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
