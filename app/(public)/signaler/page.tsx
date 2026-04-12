import Link from 'next/link'
import type { Metadata } from 'next'
import { Pencil, Trash2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Signaler une erreur ou demander le retrait — Zanimo Guide',
  description: 'Signalez une information incorrecte ou demandez le retrait d\'une fiche de l\'annuaire Zanimo Guide.',
}

export default function SignalerPage() {
  return (
    <div className="section">
      <div className="container max-w-2xl">
        <h1 className="text-h1 mb-3" style={{ color: 'var(--color-text)' }}>
          Signaler / Corriger / Retrait
        </h1>
        <p className="text-body mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Zanimo Guide s&apos;engage à maintenir des informations exactes et respectueuses des droits de chacun.
          Si vous constatez une erreur ou souhaitez qu&apos;une fiche soit retirée, utilisez les formulaires ci-dessous.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mb-10">
          <div className="card p-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'var(--color-blue-light)' }}>
              <Pencil size={18} style={{ color: 'var(--color-blue)' }} />
            </div>
            <h2 className="font-bold text-lg mb-2" style={{ color: 'var(--color-text)' }}>Corriger une fiche</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Une information est incorrecte, obsolète ou incomplète ? Signalez-le directement depuis la fiche concernée.
            </p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Accédez à la fiche, puis cliquez sur <strong>&quot;Corriger cette fiche&quot;</strong> en bas de page.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'var(--color-coral-light)' }}>
              <Trash2 size={18} style={{ color: 'var(--color-coral)' }} />
            </div>
            <h2 className="font-bold text-lg mb-2" style={{ color: 'var(--color-text)' }}>Demander le retrait</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Vous souhaitez qu&apos;une fiche soit retirée (données personnelles, activité cessée, fiche non souhaitée) ?
            </p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Accédez à la fiche, puis cliquez sur <strong>&quot;Demander le retrait&quot;</strong> en bas de page.
            </p>
          </div>
        </div>

        <div className="card p-6 mb-8" style={{ background: 'var(--color-canvas)' }}>
          <h2 className="font-bold mb-3" style={{ color: 'var(--color-text)' }}>Comment ça fonctionne ?</h2>
          <ol className="flex flex-col gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {[
              'Vous soumettez votre demande depuis la fiche concernée.',
              'Votre demande est examinée par notre équipe dans les meilleurs délais.',
              'Nous vous contactons par email si nous avons besoin d\'informations complémentaires.',
              'Si votre demande est légitime, la fiche est corrigée ou retirée.',
              'Toutes les décisions sont tracées et journalisées.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'var(--color-green)' }}>
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="card p-6">
          <h2 className="font-bold mb-3" style={{ color: 'var(--color-text)' }}>Contact direct</h2>
          <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Pour toute question ou situation urgente (données personnelles sensibles, atteinte à la vie privée) :
          </p>
          <a href="mailto:contact@zanimo-guide.re"
            className="text-sm font-semibold"
            style={{ color: 'var(--color-green)' }}>
            contact@zanimo-guide.re
          </a>
          <p className="text-xs mt-3" style={{ color: 'var(--color-muted)' }}>
            En application du RGPD, toute demande relative à des données personnelles sera traitée dans un délai maximum de 30 jours.
            Pour plus d&apos;informations, consultez notre{' '}
            <Link href="/privacy" className="underline">politique de confidentialité</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
