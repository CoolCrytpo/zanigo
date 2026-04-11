import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Devenir partenaire — ZaniGo',
  description: 'Sponsorisez ZaniGo et valorisez votre marque auprès des propriétaires d\'animaux à La Réunion.',
}

export default function SponsorPage() {
  return (
    <div className="section" style={{ background: 'var(--color-sable)' }}>
      <div className="container max-w-2xl">
        <p className="text-overline mb-3" style={{ color: 'var(--color-corail)' }}>
          Partenariat
        </p>
        <h1 className="text-h1 mb-4" style={{ color: 'var(--color-basalte)' }}>
          Devenir partenaire ZaniGo
        </h1>
        <p className="text-body-lg mb-8" style={{ color: 'var(--color-muted)' }}>
          Vous souhaitez sponsoriser ZaniGo ou lancer une campagne de visibilité ?
          Remplissez le formulaire ci-dessous, on revient vers vous rapidement.
        </p>

        <div className="card p-8">
          <p className="text-body" style={{ color: 'var(--color-muted)' }}>
            Formulaire de contact partenaire — bientôt disponible.
          </p>
          <a
            href="mailto:pro@zanigo.re"
            className="inline-block mt-4 px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
            style={{ background: 'var(--color-corail)' }}
          >
            Nous écrire directement
          </a>
        </div>
      </div>
    </div>
  )
}
