import type { Metadata } from 'next'
import { Star, MapPin, Award, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Espace pro & Partenariats — Zanimo Guide',
  description: 'Valorisez votre établissement ou service auprès des propriétaires d\'animaux à La Réunion. Contactez-nous pour discuter d\'un partenariat.',
}

const OFFERS = [
  {
    Icon: Star,
    color: '#F4B73F',
    bg: '#FFF8E6',
    title: 'Mise en avant',
    desc: 'Votre fiche apparaît en tête des résultats avec un badge "À la une". Idéal pour les établissements souhaitant une visibilité immédiate.',
  },
  {
    Icon: MapPin,
    color: '#FF6B57',
    bg: '#FFF3F1',
    title: 'Visibilité locale',
    desc: 'Sponsorisez une page commune ou catégorie. Votre établissement est mis en avant auprès des utilisateurs de votre zone.',
  },
  {
    Icon: Award,
    color: '#2A74E6',
    bg: '#EEF4FF',
    title: 'Partenariat rubrique',
    desc: 'Associez votre marque à une catégorie entière (restaurants, hébergements, services…). Visibilité maximale sur toute la rubrique.',
  },
]

export default function ProPage() {
  return (
    <div style={{ background: 'var(--color-canvas)' }}>
      {/* Hero */}
      <section className="section" style={{ background: '#1A2030' }}>
        <div className="container max-w-3xl">
          <p className="text-overline mb-3" style={{ color: 'var(--color-green)' }}>
            Espace pro & Partenariats
          </p>
          <h1 className="text-h1 text-white mb-4">
            Touchez les propriétaires d&apos;animaux à La Réunion
          </h1>
          <p className="text-body-lg mb-0" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Zanimo Guide est le guide de référence pour sortir avec son animal sur l&apos;île.
            Référencez votre établissement, valorisez votre service, soyez visible au bon moment.
          </p>
        </div>
      </section>

      {/* Offres */}
      <section className="section">
        <div className="container">
          <h2 className="text-h2 mb-2" style={{ color: 'var(--color-text)' }}>
            Formules de visibilité
          </h2>
          <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Toutes les formules sont sur devis et adaptées à votre projet. Contactez-nous pour en discuter.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {OFFERS.map((offer) => (
              <div key={offer.title} className="card p-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: offer.bg }}>
                  <offer.Icon size={18} style={{ color: offer.color }} strokeWidth={1.75} />
                </div>
                <h3 className="text-h3 mb-2" style={{ color: 'var(--color-text)' }}>
                  {offer.title}
                </h3>
                <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                  {offer.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="container max-w-xl">
          <div className="card p-8 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--color-green-light)' }}>
              <Mail size={22} style={{ color: 'var(--color-green)' }} strokeWidth={1.75} />
            </div>
            <h2 className="text-h2 mb-3" style={{ color: 'var(--color-text)' }}>
              Intéressé par un partenariat ?
            </h2>
            <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Décrivez-nous votre projet en quelques mots. On revient vers vous rapidement pour échanger.
            </p>
            <a
              href="mailto:contact@zanimo-guide.re?subject=Partenariat Zanimo Guide"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'var(--color-green)' }}
            >
              <Mail size={16} />
              contact@zanimo-guide.re
            </a>
            <p className="text-caption mt-4">
              Nous répondons sous 48h en jours ouvrés.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
