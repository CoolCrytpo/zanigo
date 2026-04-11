import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contact — ZaniGo' }

export default function ContactPage() {
  return (
    <div className="section" style={{ background: 'var(--color-sable)' }}>
      <div className="container max-w-lg">
        <h1 className="text-h1 mb-6" style={{ color: 'var(--color-basalte)' }}>Contact</h1>
        <div className="card p-6 flex flex-col gap-4">
          <p className="text-body" style={{ color: 'var(--color-muted)' }}>
            Pour toute question, signalement ou partenariat, écrivez-nous à :
          </p>
          <a href="mailto:bonjour@zanigo.re" className="text-body font-semibold" style={{ color: 'var(--color-vert)' }}>
            bonjour@zanigo.re
          </a>
          <p className="text-caption">Partenariats & sponsoring : pro@zanigo.re</p>
        </div>
      </div>
    </div>
  )
}
