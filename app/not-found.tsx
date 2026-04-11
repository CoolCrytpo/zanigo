import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center p-8 text-center"
      style={{ background: 'var(--color-sable)' }}
    >
      <p className="text-5xl mb-4">🐾</p>
      <h1 className="text-h1 mb-3" style={{ color: 'var(--color-basalte)' }}>
        Page introuvable
      </h1>
      <p className="text-body mb-8" style={{ color: 'var(--color-muted)' }}>
        Cette fiche n&apos;existe pas ou n&apos;est plus disponible.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl font-semibold text-white"
        style={{ background: 'var(--color-vert)' }}
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
