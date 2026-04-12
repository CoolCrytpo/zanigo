'use client'

import { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const REMOVAL_REASONS = [
  'Donnée inexacte', 'Donnée personnelle', 'Activité cessée',
  'Adresse personnelle', 'Fiche non souhaitée', 'Autre',
]
const ROLES = ['Gérant', 'Salarié', 'Propriétaire', 'Visiteur', 'Autre']

export default function RetraitPage() {
  const { slug } = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const listingId = searchParams.get('id')

  const [form, setForm] = useState({
    requester_name: '', requester_email: '', requester_role: '',
    request_reason: '', request_message: '', proof_url: '', confirm: false,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.confirm) { setError('Veuillez cocher la case de confirmation'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/listing-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: 'removal',
          listing_id: listingId,
          listing_slug: slug,
          requester_name: form.requester_name,
          requester_email: form.requester_email,
          requester_role: form.requester_role,
          request_reason: form.request_reason,
          request_message: form.request_message,
          proof_url: form.proof_url || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="section">
        <div className="container max-w-lg">
          <div className="card p-8 text-center">
            <div className="flex justify-center mb-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1FA97E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h1 className="text-h2 mb-2" style={{ color: 'var(--color-basalte)' }}>Demande envoyée</h1>
            <p className="text-gray-500 text-sm mb-2">
              Votre demande de retrait a bien été reçue.
            </p>
            <p className="text-gray-400 text-xs mb-6">
              Nous l'examinerons dans les meilleurs délais. Si votre demande est légitime, la fiche sera retirée ou modifiée.
            </p>
            <Link href="/" className="text-sm font-semibold underline" style={{ color: 'var(--color-vert)' }}>
              ← Accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="container max-w-lg">
        <div className="mb-6">
          <Link href={`/lieux/${slug}`} className="text-sm text-gray-400 hover:underline">← Retour à la fiche</Link>
          <h1 className="text-h2 mt-2" style={{ color: 'var(--color-basalte)' }}>Demander le retrait</h1>
          <p className="text-sm text-gray-500 mt-1">
            Vous souhaitez que cette fiche soit retirée de l'annuaire ? Expliquez-nous pourquoi.
          </p>
        </div>

        <div className="card p-4 mb-5" style={{ background: '#fef9c3', borderColor: '#fde68a' }}>
          <p className="text-sm text-amber-700">
            <strong>Important :</strong> les demandes de retrait sont examinées manuellement. Seules les demandes légitimes
            (données erronées, données personnelles, activité cessée) sont traitées.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-basalte)' }}>Votre nom *</label>
              <input type="text" required value={form.requester_name} onChange={e => set('requester_name', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-basalte)' }}>Email *</label>
              <input type="email" required value={form.requester_email} onChange={e => set('requester_email', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-border)' }} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-basalte)' }}>Vous êtes</label>
            <select value={form.requester_role} onChange={e => set('requester_role', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
              style={{ borderColor: 'var(--color-border)' }}>
              <option value="">Sélectionner…</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-basalte)' }}>Motif de la demande *</label>
            <select required value={form.request_reason} onChange={e => set('request_reason', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
              style={{ borderColor: 'var(--color-border)' }}>
              <option value="">Sélectionner…</option>
              {REMOVAL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-basalte)' }}>Message *</label>
            <textarea required value={form.request_message} onChange={e => set('request_message', e.target.value)}
              rows={4} placeholder="Expliquez votre demande en détail…"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)' }} />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-basalte)' }}>
              Preuve <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input type="url" value={form.proof_url} onChange={e => set('proof_url', e.target.value)}
              placeholder="https://…"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: 'var(--color-border)' }} />
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={form.confirm} onChange={e => set('confirm', e.target.checked)}
              className="mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600">
              Je confirme que ma demande est légitime et que les informations fournies sont exactes.
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: '#dc2626' }}>
            {loading ? 'Envoi…' : 'Envoyer la demande de retrait'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Contact direct : <a href="mailto:contact@zanimo.guide" className="underline">contact@zanimo.guide</a>
        </p>
      </div>
    </div>
  )
}
