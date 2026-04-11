'use client'

import { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const CORRECTION_TYPES = [
  'Nom du lieu', 'Catégorie', 'Adresse', 'Téléphone', 'Email', 'Site web',
  'Réseaux sociaux', 'Politique animaux', 'Horaires', 'Autre',
]
const ROLES = ['Gérant', 'Salarié', 'Propriétaire', 'Visiteur', 'Autre']

export default function CorrigerPage() {
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
          request_type: 'correction',
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
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-h2 mb-2" style={{ color: 'var(--color-basalte)' }}>Demande envoyée</h1>
            <p className="text-gray-500 text-sm mb-6">
              Votre demande de correction a bien été reçue. Nous la traiterons dans les meilleurs délais.
            </p>
            <Link href={`/lieux/${slug}`} className="text-sm font-semibold underline" style={{ color: 'var(--color-vert)' }}>
              ← Retour à la fiche
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
          <h1 className="text-h2 mt-2" style={{ color: 'var(--color-basalte)' }}>Corriger cette fiche</h1>
          <p className="text-sm text-gray-500 mt-1">
            Une information est incorrecte ou obsolète ? Signalez-le ici.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
          <input type="hidden" name="listing_id" value={listingId ?? ''} />
          <input type="hidden" name="listing_slug" value={slug} />

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
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-basalte)' }}>Type de correction *</label>
            <select required value={form.request_reason} onChange={e => set('request_reason', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
              style={{ borderColor: 'var(--color-border)' }}>
              <option value="">Sélectionner…</option>
              {CORRECTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-basalte)' }}>Description de la correction *</label>
            <textarea required value={form.request_message} onChange={e => set('request_message', e.target.value)}
              rows={4} placeholder="Décrivez ce qui est incorrect et la valeur correcte…"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)' }} />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-basalte)' }}>
              Preuve ou source <span className="text-gray-400 font-normal">(optionnel)</span>
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
              Je confirme que les informations fournies sont exactes et que ma demande est légitime.
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'var(--color-vert)' }}>
            {loading ? 'Envoi…' : 'Envoyer la demande de correction'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Questions ? <a href="mailto:contact@zanimo.guide" className="underline">contact@zanimo.guide</a>
        </p>
      </div>
    </div>
  )
}
