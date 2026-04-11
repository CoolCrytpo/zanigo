import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Confidentialité — ZaniGo' }
export default function PrivacyPage() {
  return (
    <div className="section" style={{ background: 'var(--color-sable)' }}>
      <div className="container max-w-2xl">
        <h1 className="text-h1 mb-6" style={{ color: 'var(--color-basalte)' }}>Politique de confidentialité</h1>
        <div className="card p-6">
          <p className="text-body" style={{ color: 'var(--color-muted)' }}>À compléter selon les usages de données de ZaniGo.</p>
        </div>
      </div>
    </div>
  )
}
