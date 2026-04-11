import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Espace pro — Zanimo Guide',
  description: 'Référencez votre établissement, valorisez votre service et touchez les propriétaires d\'animaux à La Réunion.',
}

const OFFERS = [
  {
    icon: '⭐',
    title: 'Fiche mise à la une',
    desc: 'Votre fiche apparaît en tête des résultats ciblés avec un badge mis en avant.',
    price: 'Sur devis',
    color: 'var(--color-jaune)',
  },
  {
    icon: '📍',
    title: 'À la une locale',
    desc: 'Visibilité sur la home ou une page catégorie / commune. Visuel + CTA.',
    price: 'Sur devis',
    color: 'var(--color-corail)',
  },
  {
    icon: '🏆',
    title: 'Sponsor de rubrique',
    desc: 'Sponsorisez une catégorie ou une zone géographique complète.',
    price: 'Sur devis',
    color: 'var(--color-lagon)',
  },
]

export default function ProPage() {
  return (
    <div style={{ background: 'var(--color-sable)' }}>
      {/* Hero */}
      <section
        className="section"
        style={{ background: 'var(--color-basalte)' }}
      >
        <div className="container max-w-3xl">
          <p className="text-overline mb-3" style={{ color: 'var(--color-vert)' }}>
            Espace pro
          </p>
          <h1 className="text-h1 text-white mb-4">
            Touchez les propriétaires d&apos;animaux à La Réunion
          </h1>
          <p className="text-body-lg mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Zanimo Guide est le guide de référence pour sortir avec son animal sur l&apos;île.
            Référencez votre établissement, valorisez votre service, soyez visible au bon moment.
          </p>
          <Link
            href="/pro/sponsor"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'var(--color-corail)' }}
          >
            Voir les offres partenaires
          </Link>
        </div>
      </section>

      {/* Offers */}
      <section className="section">
        <div className="container">
          <h2 className="text-h2 mb-6" style={{ color: 'var(--color-basalte)' }}>
            Offres de visibilité
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {OFFERS.map((offer) => (
              <div key={offer.title} className="card p-6">
                <span className="text-3xl block mb-3">{offer.icon}</span>
                <h3 className="text-h3 mb-2" style={{ color: 'var(--color-basalte)' }}>
                  {offer.title}
                </h3>
                <p className="text-body mb-4" style={{ color: 'var(--color-muted)' }}>
                  {offer.desc}
                </p>
                <p className="text-sm font-bold" style={{ color: offer.color }}>
                  {offer.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA contact */}
      <section className="section">
        <div className="container max-w-xl text-center">
          <h2 className="text-h2 mb-3" style={{ color: 'var(--color-basalte)' }}>
            Intéressé ?
          </h2>
          <p className="text-body mb-6" style={{ color: 'var(--color-muted)' }}>
            Contactez-nous pour discuter de votre projet de visibilité.
          </p>
          <Link
            href="mailto:pro@zanimo.guide"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'var(--color-vert)' }}
          >
            Nous contacter
          </Link>
          <p className="text-caption mt-4">ou via <Link href="/pro/sponsor" style={{ color: 'var(--color-vert)' }}>la page sponsor</Link></p>
        </div>
      </section>
    </div>
  )
}
