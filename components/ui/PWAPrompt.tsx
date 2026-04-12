'use client'

import { useState, useEffect } from 'react'
import { X, Share, Plus, Smartphone } from 'lucide-react'

type Platform = 'ios' | 'android' | 'desktop' | null

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const isAndroid = /Android/i.test(ua)
  if (isIOS) return 'ios'
  if (isAndroid) return 'android'
  return 'desktop'
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as { standalone?: boolean }).standalone === true
}

export function PWAPrompt() {
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState<Platform>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Already installed or already dismissed
    if (isStandalone()) return
    try {
      if (localStorage.getItem('zanimo_pwa_dismissed')) return
    } catch {}

    const p = detectPlatform()
    setPlatform(p)

    // Android: capture native prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (p === 'android') setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)

    // iOS: show manual guide after 3s
    let timer: ReturnType<typeof setTimeout>
    if (p === 'ios') {
      timer = setTimeout(() => setVisible(true), 3000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener)
      clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    try { localStorage.setItem('zanimo_pwa_dismissed', '1') } catch {}
  }

  const installAndroid = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      try { localStorage.setItem('zanimo_pwa_dismissed', '1') } catch {}
    }
    setVisible(false)
  }

  if (!visible || platform === 'desktop') return null

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl shadow-2xl overflow-hidden"
      style={{ background: '#fff', border: '1px solid var(--color-border)', maxWidth: '420px', margin: '0 auto' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
            <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#2A74E6"/>
              <path d="M 8.5 10 L 23.5 10 L 8.5 22 L 23.5 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="25" cy="9" r="3.5" fill="#1FA97E"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
              Zanimo Guide
            </p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Ajouter à l&apos;écran d&apos;accueil</p>
          </div>
        </div>
        <button onClick={dismiss} className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-border)', color: 'var(--color-muted)' }}
          aria-label="Fermer">
          <X size={13} />
        </button>
      </div>

      {/* Content */}
      {platform === 'android' ? (
        <div className="px-4 pb-4">
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Accède à Zanimo Guide directement depuis ton écran d&apos;accueil, comme une appli.
          </p>
          <button
            onClick={installAndroid}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: '#2A74E6' }}>
            <Smartphone size={15} />
            Installer l&apos;application
          </button>
        </div>
      ) : (
        /* iOS — guide manuel */
        <div className="px-4 pb-4">
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Accède à Zanimo Guide depuis ton écran d&apos;accueil en 2 étapes :
          </p>
          <ol className="flex flex-col gap-2.5">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs text-white"
                style={{ background: '#2A74E6' }}>1</div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Tape <span className="inline-flex items-center gap-1 font-bold px-1.5 py-0.5 rounded-md text-xs"
                    style={{ background: 'var(--color-blue-light)', color: '#2A74E6' }}>
                    <Share size={11} /> Partager
                  </span> en bas de Safari
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  L&apos;icône avec la flèche vers le haut
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs text-white"
                style={{ background: '#2A74E6' }}>2</div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Sélectionne <span className="inline-flex items-center gap-1 font-bold px-1.5 py-0.5 rounded-md text-xs"
                    style={{ background: 'var(--color-blue-light)', color: '#2A74E6' }}>
                    <Plus size={11} /> Sur l&apos;écran d&apos;accueil
                  </span>
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  Puis confirme en haut à droite
                </p>
              </div>
            </li>
          </ol>
          <button onClick={dismiss}
            className="w-full mt-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'var(--color-border)', color: 'var(--color-muted)' }}>
            Plus tard
          </button>
        </div>
      )}
    </div>
  )
}
