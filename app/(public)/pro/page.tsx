import type { Metadata } from 'next'
import { Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Espace pro & Partenariats — Zanimo Guide',
  description: 'Collaborez avec Zanimo Guide pour toucher les propriétaires d\'animaux à La Réunion.',
}

export default function ProPage() {
  return (
    <div style={{ background: 'var(--color-canvas)', minHeight: '100dvh' }}>
      <section className="section">
        <div className="container max-w-xl">
          <p className="text-overline mb-3" style={{ color: 'var(--color-green)' }}>
            Espace pro & Partenariats
          </p>
          <h1 className="text-h1 mb-4" style={{ color: 'var(--color-text)' }}>
            Un projet avec Zanimo Guide ?
          </h1>
          <p className="text-body-lg mb-10" style={{ color: 'var(--color-text-secondary)' }}>
            Référencement, mise en avant, partenariat éditorial, communication dédiée…
            Décrivez votre idée en quelques mots. On revient vers vous rapidement pour en discuter.
          </p>

          <div className="card p-7 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--color-green-light)' }}>
                <Mail size={18} style={{ color: 'var(--color-green)' }} strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Contactez-nous par email</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Réponse sous 48h en jours ouvrés</p>
              </div>
            </div>
            <a
              href="mailto:contact@zanimo-guide.re?subject=Partenariat Zanimo Guide"
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm"
              style={{ background: 'var(--color-green)' }}>
              <Mail size={15} />
              contact@zanimo-guide.re
            </a>

            {/* Freemium preview */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
                Services à venir — Freemium
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'Référencement gratuit', status: 'Disponible', statusColor: 'var(--color-green)', bg: 'var(--color-green-light)' },
                  { label: 'Mise à la une', status: 'Prochainement', statusColor: '#8B5CF6', bg: '#F3EEFF' },
                  { label: 'Communication dédiée', status: 'Prochainement', statusColor: '#8B5CF6', bg: '#F3EEFF' },
                  { label: 'Encart sponsorisé', status: 'Prochainement', statusColor: '#8B5CF6', bg: '#F3EEFF' },
                ].map(({ label, status, statusColor, bg }) => (
                  <div key={label} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: '#fafafa', border: '1px solid var(--color-border)' }}>
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>{label}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: bg, color: statusColor }}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
