import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Signaler une erreur ou demander le retrait d\'une fiche — ZaniGo',
  description: 'Signalez une information incorrecte ou demandez le retrait d\'une fiche de l\'annuaire ZaniGo.',
}

export default function SignalerPage() {
  return (
    <div className="section">
      <div className="container max-w-2xl">
        <h1 className="text-h1 mb-3" style={{ color: 'var(--color-basalte)' }}>
          Signaler une erreur ou demander le retrait d'une fiche
        </h1>
        <p className="text-gray-500 mb-8">
          ZaniGo s'engage à maintenir des informations exactes et respectueuses des droits de chacun.
          Si vous constatez une erreur ou souhaitez qu'une fiche soit retirée, utilisez les formulaires ci-dessous.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mb-10">
          <div className="card p-6">
            <div className="text-3xl mb-3">✏️</div>
            <h2 className="font-bold text-lg mb-2" style={{ color: 'var(--color-basalte)' }}>Corriger une fiche</h2>
            <p className="text-sm text-gray-500 mb-4">
              Une information est incorrecte, obsolète ou incomplète ? Signalez-le directement depuis la fiche concernée.
            </p>
            <p className="text-xs text-gray-400">
              Accédez à la fiche, puis cliquez sur <strong>"Corriger cette fiche"</strong> en bas de page.
            </p>
          </div>

          <div className="card p-6">
            <div className="text-3xl mb-3">🗑️</div>
            <h2 className="font-bold text-lg mb-2" style={{ color: 'var(--color-basalte)' }}>Demander le retrait</h2>
            <p className="text-sm text-gray-500 mb-4">
              Vous souhaitez qu'une fiche soit retirée (données personnelles, activité cessée, fiche non souhaitée) ?
            </p>
            <p className="text-xs text-gray-400">
              Accédez à la fiche, puis cliquez sur <strong>"Demander le retrait"</strong> en bas de page.
            </p>
          </div>
        </div>

        <div className="card p-6 mb-8" style={{ background: 'var(--color-sable)' }}>
          <h2 className="font-bold mb-3" style={{ color: 'var(--color-basalte)' }}>Comment ça fonctionne ?</h2>
          <ol className="flex flex-col gap-2 text-sm text-gray-600">
            {[
              'Vous soumettez votre demande depuis la fiche concernée.',
              'Votre demande est examinée par notre équipe dans les meilleurs délais.',
              'Nous vous contactons par email si nous avons besoin d\'informations complémentaires.',
              'Si votre demande est légitime, la fiche est corrigée ou retirée.',
              'Toutes les décisions sont tracées et journalisées.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'var(--color-vert)' }}>
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="card p-6">
          <h2 className="font-bold mb-3" style={{ color: 'var(--color-basalte)' }}>Contact direct</h2>
          <p className="text-sm text-gray-500 mb-2">
            Pour toute question ou situation urgente (données personnelles sensibles, atteinte à la vie privée) :
          </p>
          <a href="mailto:contact@zanigo.re"
            className="text-sm font-semibold"
            style={{ color: 'var(--color-vert)' }}>
            contact@zanigo.re
          </a>
          <p className="text-xs text-gray-400 mt-3">
            En application du RGPD, toute demande relative à des données personnelles sera traitée dans un délai maximum de 30 jours.
            Pour plus d'informations, consultez notre{' '}
            <Link href="/privacy" className="underline">politique de confidentialité</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
