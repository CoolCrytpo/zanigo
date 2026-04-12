'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem('zanimo_cookie_consent')
      if (!consent) setVisible(true)
    } catch {
      // localStorage not available (SSR or private mode)
    }
  }, [])

  const accept = () => {
    try { localStorage.setItem('zanimo_cookie_consent', 'accepted') } catch {}
    setVisible(false)
  }

  const decline = () => {
    try { localStorage.setItem('zanimo_cookie_consent', 'declined') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: '#1A2030',
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      <div className="container py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '60ch' }}>
            Ce site utilise uniquement des cookies essentiels (mémorisation de vos préférences).
            Aucun tracking publicitaire.{' '}
            <Link href="/privacy" className="underline" style={{ color: 'rgba(255,255,255,0.9)' }}>
              En savoir plus
            </Link>
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={decline}
              className="px-4 py-2 text-sm rounded-xl border transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}
            >
              Refuser
            </button>
            <button
              onClick={accept}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-white transition-colors"
              style={{ background: 'var(--color-green)' }}
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
