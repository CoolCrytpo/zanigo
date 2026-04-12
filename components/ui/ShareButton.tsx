'use client'
import { useState, useRef, useEffect } from 'react'
import { Share2, Copy, Mail, Check, X } from 'lucide-react'

interface Props {
  title: string
  url?: string
  className?: string
}

// Icon-only share targets
const SHARE_TARGETS = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    getUrl: (u: string, t: string) => `https://wa.me/?text=${encodeURIComponent(t + ' — ' + u)}`,
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.128.557 4.127 1.535 5.862L.057 23.8a.5.5 0 0 0 .613.63l6.094-1.6A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.872 0-3.626-.497-5.143-1.366l-.363-.215-3.76.986.998-3.648-.233-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    ),
    color: '#25D366',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    getUrl: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
    color: '#1877F2',
  },
  {
    key: 'sms',
    label: 'SMS',
    getUrl: (u: string, t: string) => `sms:?body=${encodeURIComponent(t + ' — ' + u)}`,
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    color: '#6b7280',
    mobileOnly: true,
  },
  {
    key: 'email',
    label: 'Email',
    getUrl: (u: string, t: string) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(u)}`,
    icon: () => <Mail size={18} />,
    color: '#374151',
  },
]

export function ShareButton({ title, url, className }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '')

  useEffect(() => {
    setIsMobile(/iPhone|iPad|Android/i.test(navigator.userAgent))
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleShare = async () => {
    // Native Web Share API (mobile)
    if (navigator.share && isMobile) {
      try {
        await navigator.share({ title, url: shareUrl })
        return
      } catch { /* user cancelled or not supported */ }
    }
    setOpen(v => !v)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => { setCopied(false); setOpen(false) }, 1500)
    } catch { /* clipboard not available */ }
  }

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        onClick={handleShare}
        className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
        style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
        title="Partager"
        aria-label="Partager"
      >
        <Share2 size={16} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 rounded-2xl shadow-xl z-50 p-3 flex flex-col gap-1"
          style={{ background: '#fff', border: '1px solid var(--color-border)', minWidth: '180px' }}
        >
          {/* Close */}
          <div className="flex items-center justify-between mb-1 px-1">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>Partager</span>
            <button onClick={() => setOpen(false)} className="opacity-40 hover:opacity-70">
              <X size={13} />
            </button>
          </div>

          {/* Copy link */}
          <button onClick={copy}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all w-full text-left"
            style={{ background: copied ? 'var(--color-green-light)' : 'var(--color-canvas)', color: copied ? 'var(--color-green)' : 'var(--color-text)' }}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Lien copié !' : 'Copier le lien'}
          </button>

          {/* Social targets */}
          {SHARE_TARGETS.filter(t => !t.mobileOnly || isMobile).map(target => (
            <a key={target.key}
              href={target.getUrl(shareUrl, title)}
              target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ color: target.color, background: 'transparent' }}
              title={target.label}
              aria-label={target.label}>
              <target.icon />
              {target.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
