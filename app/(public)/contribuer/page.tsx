'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

// Note: metadata export won't work in client components
// Move to a server wrapper if SEO matters (not critical for this form page)

const TYPES = [
  { value: 'new_listing', label: 'Proposer un nouveau lieu' },
  { value: 'correction',  label: 'Corriger une fiche existante' },
]

const DOG_POLICIES = [
  { value: 'allowed',     label: 'Accepté' },
  { value: 'conditional', label: 'Sous conditions' },
  { value: 'disallowed',  label: 'Non autorisé' },
  { value: 'unknown',     label: 'Je ne sais pas' },
]

export default function ContribuerPage() {
  const [type, setType] = useState('new_listing')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [commune, setCommune] = useState('')
  const [dogPolicy, setDogPolicy] = useState('unknown')
  const [conditions, setConditions] = useState('')
  const [source, setSource] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data: { name, address, commune, dog_policy: dogPolicy, conditions, source, comment },
        }),
      })
      if (!res.ok) throw new Error()
      setSuccess(true)
    } catch {
      setError('Erreur lors de l\'envoi. Réessaie plus tard.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="section" style={{ background: 'var(--color-sable)' }}>
        <div className="container max-w-lg text-center py-16">
          <p className="text-4xl mb-4">🐾</p>
          <h1 className="text-h1 mb-3" style={{ color: 'var(--color-basalte)' }}>
            Merci !
          </h1>
          <p className="text-body" style={{ color: 'var(--color-muted)' }}>
            Ta contribution a bien été reçue. On la vérifie avant publication.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="section" style={{ background: 'var(--color-sable)' }}>
      <div className="container max-w-lg">
        <h1 className="text-h1 mb-2" style={{ color: 'var(--color-basalte)' }}>
          Contribuer
        </h1>
        <p className="text-body mb-8" style={{ color: 'var(--color-muted)' }}>
          Tu connais un lieu, spot ou service dog-friendly à La Réunion ? Partage-le.
        </p>

        <form onSubmit={onSubmit} className="card p-6 flex flex-col gap-5">
          {/* Type */}
          <div>
            <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--color-basalte)' }}>
              Type de contribution
            </label>
            <div className="flex flex-col gap-2">
              {TYPES.map((t) => (
                <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={t.value}
                    checked={type === t.value}
                    onChange={() => setType(t.value)}
                    className="accent-green-700"
                  />
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-basalte)' }}>
              Nom du lieu *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Plage de l'Hermitage"
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          {/* Commune */}
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-basalte)' }}>
              Commune
            </label>
            <input
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              placeholder="Ex: Saint-Paul"
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-basalte)' }}>
              Adresse ou localisation
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adresse, URL Maps, description…"
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          {/* Dog policy */}
          <div>
            <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--color-basalte)' }}>
              Politique chiens
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DOG_POLICIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setDogPolicy(p.value)}
                  className="text-sm py-2 px-3 rounded-xl border font-medium transition-all"
                  style={{
                    borderColor: dogPolicy === p.value ? 'var(--color-vert)' : 'var(--color-border)',
                    background: dogPolicy === p.value ? 'var(--color-vert-light)' : '#fff',
                    color: dogPolicy === p.value ? 'var(--color-vert)' : 'var(--color-muted)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-basalte)' }}>
              Conditions ou remarques
            </label>
            <textarea
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="Ex: chiens tenus en laisse, terrasse uniquement…"
              rows={3}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          {/* Source */}
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-basalte)' }}>
              Source de l&apos;info
            </label>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="URL, vu sur place, site officiel…"
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'var(--color-corail)' }}
          >
            {submitting ? 'Envoi en cours…' : 'Envoyer ma contribution'}
          </button>

          <p className="text-caption text-center">
            Toute contribution est vérifiée avant publication. Merci pour ton aide !
          </p>
        </form>
      </div>
    </div>
  )
}
