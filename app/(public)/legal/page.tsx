import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Mentions légales — Zanimo Guide' }

export default function LegalPage() {
  return (
    <div className="section" style={{ background: 'var(--color-canvas)' }}>
      <div className="container max-w-2xl">
        <h1 className="text-h1 mb-2" style={{ color: 'var(--color-text)' }}>Mentions légales</h1>
        <p className="text-caption mb-8">Mise à jour : avril 2026</p>

        <div className="flex flex-col gap-6">

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>Éditeur du site</h2>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              <strong>Zanimo Guide</strong><br />
              Site éditorial indépendant à but non commercial.<br />
              Siège : La Réunion (974), France<br />
              Contact : <a href="mailto:contact@zanimo-guide.re" style={{ color: 'var(--color-green)' }}>contact@zanimo-guide.re</a>
            </p>
          </section>

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>Directeur de la publication</h2>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              Le directeur de la publication est le responsable éditorial de Zanimo Guide, joignable à l&apos;adresse :
              <br />
              <a href="mailto:contact@zanimo-guide.re" style={{ color: 'var(--color-green)' }}>contact@zanimo-guide.re</a>
            </p>
          </section>

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>Hébergement</h2>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              Le site est hébergé par :<br />
              <strong>Vercel Inc.</strong><br />
              440 N Barranca Ave #4133, Covina, CA 91723, USA<br />
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-green)' }}>vercel.com</a>
            </p>
          </section>

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>Propriété intellectuelle</h2>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              L&apos;ensemble du contenu éditorial de Zanimo Guide (textes, descriptions, structure des fiches)
              est la propriété de ses éditeurs. Toute reproduction, même partielle, sans autorisation préalable est interdite.
              <br /><br />
              Les données relatives aux établissements (noms, adresses, politiques d&apos;accueil des animaux)
              sont collectées de sources publiques et vérifiées par notre équipe. Elles n&apos;engagent pas
              la responsabilité des établissements référencés si les informations ont évolué entre deux vérifications.
            </p>
          </section>

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>Responsabilité</h2>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              Zanimo Guide s&apos;efforce de maintenir des informations exactes et à jour.
              Cependant, nous ne pouvons garantir l&apos;exactitude, la complétude ou l&apos;actualité des informations publiées,
              notamment concernant les politiques d&apos;accueil des animaux qui peuvent évoluer.
              L&apos;utilisateur est invité à vérifier les informations auprès des établissements concernés avant tout déplacement.
              <br /><br />
              Toute fiche peut être signalée ou corrigée via le formulaire disponible sur chaque page de fiche ou en nous contactant directement.
            </p>
          </section>

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>Données personnelles</h2>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              Pour toute question relative au traitement de vos données personnelles, consultez notre{' '}
              <Link href="/privacy" style={{ color: 'var(--color-green)' }}>politique de confidentialité</Link>.
            </p>
          </section>

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>Loi applicable</h2>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              Le présent site est soumis au droit français. Tout litige relatif à son utilisation
              relève de la compétence exclusive des tribunaux français.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
