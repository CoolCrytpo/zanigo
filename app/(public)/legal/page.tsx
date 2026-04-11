import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Mentions légales — ZaniGo' }
export default function LegalPage() {
  return (
    <div className="section" style={{ background: 'var(--color-sable)' }}>
      <div className="container max-w-2xl">
        <h1 className="text-h1 mb-6" style={{ color: 'var(--color-basalte)' }}>Mentions légales</h1>
        <div className="card p-6">
          <p className="text-body" style={{ color: 'var(--color-muted)' }}>À compléter selon la structure juridique de ZaniGo.</p>
        </div>
      </div>
    </div>
  )
}
