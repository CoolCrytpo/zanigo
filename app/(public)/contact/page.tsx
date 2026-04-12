import type { Metadata } from 'next'
import { Mail } from 'lucide-react'

export const metadata: Metadata = { title: 'Contact — Zanimo Guide' }

export default function ContactPage() {
  return (
    <div className="section" style={{ background: 'var(--color-canvas)' }}>
      <div className="container max-w-lg">
        <h1 className="text-h1 mb-6" style={{ color: 'var(--color-text)' }}>Contact</h1>
        <div className="card p-6 flex flex-col gap-4">
          <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
            Pour toute question, signalement ou partenariat :
          </p>
          <a
            href="mailto:contact@zanimo-guide.re"
            className="inline-flex items-center gap-2 font-semibold"
            style={{ color: 'var(--color-green)' }}
          >
            <Mail size={16} />
            contact@zanimo-guide.re
          </a>
          <p className="text-caption">
            Réponse sous 48h en jours ouvrés.
          </p>
        </div>
      </div>
    </div>
  )
}
