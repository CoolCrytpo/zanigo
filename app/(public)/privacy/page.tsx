import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Politique de confidentialité — Zanimo Guide' }

export default function PrivacyPage() {
  return (
    <div className="section" style={{ background: 'var(--color-canvas)' }}>
      <div className="container max-w-2xl">
        <h1 className="text-h1 mb-2" style={{ color: 'var(--color-text)' }}>Politique de confidentialité</h1>
        <p className="text-caption mb-8">Mise à jour : avril 2026 — Conforme RGPD (Règlement UE 2016/679)</p>

        <div className="flex flex-col gap-6">

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>1. Responsable du traitement</h2>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              <strong>Zanimo Guide</strong><br />
              La Réunion (974), France<br />
              Contact DPO : <a href="mailto:contact@zanimo-guide.re" style={{ color: 'var(--color-green)' }}>contact@zanimo-guide.re</a>
            </p>
          </section>

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>2. Données collectées</h2>
            <div className="text-body flex flex-col gap-3" style={{ color: 'var(--color-text-secondary)' }}>
              <p><strong>Formulaire de contribution (proposer un lieu)</strong></p>
              <ul className="list-disc pl-5 flex flex-col gap-1">
                <li>Pseudo (facultatif)</li>
                <li>Adresse email (facultative, pour vous répondre uniquement)</li>
                <li>Informations sur le lieu proposé (nom, adresse, commune, politique chiens, source)</li>
              </ul>
              <p><strong>Navigation sur le site</strong></p>
              <ul className="list-disc pl-5 flex flex-col gap-1">
                <li>Données techniques de navigation (adresse IP, type de navigateur) collectées automatiquement par l&apos;hébergeur Vercel</li>
                <li>Réactions aux fiches (stockées localement dans votre navigateur via localStorage — aucune donnée transmise à un serveur tiers)</li>
              </ul>
              <p><strong>Ce que nous ne collectons pas</strong></p>
              <ul className="list-disc pl-5 flex flex-col gap-1">
                <li>Pas de compte utilisateur, pas d&apos;inscription</li>
                <li>Pas de suivi publicitaire, pas de pixel de tracking</li>
                <li>Pas de partage de données avec des tiers à des fins commerciales</li>
              </ul>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>3. Finalités et bases légales</h2>
            <div className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th className="text-left py-2 pr-4 font-semibold" style={{ color: 'var(--color-text)' }}>Finalité</th>
                    <th className="text-left py-2 font-semibold" style={{ color: 'var(--color-text)' }}>Base légale</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Traitement des contributions', 'Consentement (art. 6.1.a RGPD)'],
                    ['Réponse aux demandes de contact', 'Intérêt légitime (art. 6.1.f RGPD)'],
                    ['Sécurité et logs techniques', 'Intérêt légitime (art. 6.1.f RGPD)'],
                    ['Demandes de retrait / correction RGPD', 'Obligation légale (art. 6.1.c RGPD)'],
                  ].map(([fin, base]) => (
                    <tr key={fin} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td className="py-2 pr-4">{fin}</td>
                      <td className="py-2">{base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>4. Durée de conservation</h2>
            <ul className="text-body flex flex-col gap-2 list-disc pl-5" style={{ color: 'var(--color-text-secondary)' }}>
              <li>Contributions reçues : conservées le temps du traitement éditorial, supprimées sur demande</li>
              <li>Emails de contact : supprimés au plus tard 12 mois après la clôture de la demande</li>
              <li>Logs techniques : conservés 90 jours par Vercel</li>
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>5. Vos droits</h2>
            <p className="text-body mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="text-body flex flex-col gap-1.5 list-disc pl-5" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>Droit d&apos;accès</strong> : obtenir une copie des données vous concernant</li>
              <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
              <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données</li>
              <li><strong>Droit d&apos;opposition</strong> : vous opposer à un traitement fondé sur l&apos;intérêt légitime</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
              <li><strong>Droit de retrait du consentement</strong> : à tout moment, sans affecter les traitements antérieurs</li>
            </ul>
            <p className="text-body mt-4" style={{ color: 'var(--color-text-secondary)' }}>
              Pour exercer vos droits :{' '}
              <a href="mailto:contact@zanimo-guide.re" style={{ color: 'var(--color-green)' }}>
                contact@zanimo-guide.re
              </a>
              {' '}— délai de réponse : 30 jours maximum.
            </p>
            <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              En cas de réclamation non résolue, vous pouvez saisir la CNIL :{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-green)' }}>
                www.cnil.fr
              </a>
            </p>
          </section>

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>6. Cookies</h2>
            <p className="text-body mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Zanimo Guide n&apos;utilise pas de cookies publicitaires ou de tracking. Seuls des cookies essentiels
              sont utilisés :
            </p>
            <ul className="text-body flex flex-col gap-1.5 list-disc pl-5" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>zanimo_cookie_consent</strong> : mémorise votre choix de consentement aux cookies (localStorage, 13 mois)</li>
              <li><strong>zanimo_reactions_*</strong> : stocke vos réactions aux fiches localement (localStorage, pas de transmission serveur)</li>
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>7. Sécurité</h2>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              Le site est servi exclusivement en HTTPS. Les contributions sont stockées dans une base de données
              sécurisée avec accès restreint. Aucune donnée de carte bancaire n&apos;est traitée par Zanimo Guide.
            </p>
          </section>

          <section className="card p-6">
            <h2 className="text-h3 mb-3" style={{ color: 'var(--color-text)' }}>8. Modifications</h2>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              Cette politique peut être mise à jour pour refléter des évolutions légales ou fonctionnelles.
              La date de mise à jour en tête de page fait foi. Les changements significatifs seront signalés lors de votre prochaine visite.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
