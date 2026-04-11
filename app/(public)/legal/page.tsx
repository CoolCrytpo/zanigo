import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Mentions légales — Zanimo Guide' }
export default function LegalPage() {
  return (
    <div className="section" style={{ background: 'var(--color-canvas)' }}>
      <div className="container max-w-2xl">
        <h1 className="text-h1 mb-6" style={{ color: 'var(--color-text)' }}>Mentions légales</h1>
        <div className="card p-6">
          <p className="text-body" style={{ color: 'var(--color-muted)' }}>À compléter selon la structure juridique de Zanimo Guide.</p>
        </div>
      </div>
    </div>
  )
}
