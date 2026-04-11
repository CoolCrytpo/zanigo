'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS, APP_NAME } from '@/config/constants'

export function TopNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-200"
      style={{
        background: scrolled
          ? 'rgba(245,241,232,0.95)'
          : 'var(--color-sable)',
        borderBottom: scrolled
          ? '1px solid var(--color-border)'
          : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div className="container">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-basalte)' }}
          >
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
              style={{ background: 'var(--color-vert)' }}
            >
              Z
            </span>
            {APP_NAME}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: isActive(link.href) ? 'var(--color-vert)' : 'var(--color-muted)',
                  background: isActive(link.href) ? 'var(--color-vert-light)' : 'transparent',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/contribuer"
              className="hidden sm:block text-sm font-semibold px-4 py-1.5 rounded-lg transition-all"
              style={{
                background: 'var(--color-corail)',
                color: '#fff',
                fontFamily: 'var(--font-ui)',
              }}
            >
              + Ajouter
            </Link>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg"
              style={{ color: 'var(--color-basalte)' }}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <span
                className="w-5 h-0.5 rounded-full transition-all duration-200"
                style={{
                  background: 'currentColor',
                  transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none',
                }}
              />
              <span
                className="w-5 h-0.5 rounded-full transition-all duration-200"
                style={{
                  background: 'currentColor',
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                className="w-5 h-0.5 rounded-full transition-all duration-200"
                style={{
                  background: 'currentColor',
                  transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-sable)' }}
        >
          <nav className="container py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 rounded-lg text-sm font-medium"
                style={{
                  color: isActive(link.href) ? 'var(--color-vert)' : 'var(--color-text)',
                  background: isActive(link.href) ? 'var(--color-vert-light)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contribuer"
              className="mt-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-center"
              style={{ background: 'var(--color-corail)', color: '#fff' }}
            >
              + Ajouter un lieu
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
