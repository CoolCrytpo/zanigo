'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import type { ListingRequest } from '@/lib/ingestion/types'

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nouvelle' },
  { value: 'under_review', label: 'En cours d\'examen' },
  { value: 'need_more_info', label: 'Info manquante' },
  { value: 'accepted', label: 'Acceptée' },
  { value: 'rejected', label: 'Rejetée' },
  { value: 'applied', label: 'Appliquée' },
  { value: 'closed', label: 'Fermée' },
]

const TYPE_LABEL: Record<string, string> = {
  correction: '✏️ Correction', removal: '🗑️ Demande de retrait',
  objection: '⚠️ Opposition', other: '💬 Autre demande',
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [req, setReq] = useState<ListingRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/requests/${id}`)
      .then(r => r.json())
      .then(data => {
        setReq(data)
        setStatus(data.status)
        setResponse(data.admin_response ?? '')
      })
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true); setError(null); setSaved(false)
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_response: response }),
      })
      if (!res.ok) throw new Error('Erreur')
      setSaved(true)
    } catch {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-sm text-gray-400 p-6">Chargement…</div>
  if (!req) return <div className="text-sm text-red-500 p-6">Demande introuvable</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/requests" className="text-sm text-gray-400 hover:underline">← Demandes</a>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
          {TYPE_LABEL[req.request_type] ?? req.request_type}
        </h1>
      </div>

      {/* Demandeur */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-400">Demandeur</h2>
        <dl className="flex flex-col gap-2 text-sm">
          {[
            ['Nom', req.requester_name],
            ['Email', req.requester_email],
            ['Qualité', req.requester_role ?? '—'],
            ['Reçue le', new Date(req.received_at).toLocaleString('fr-FR')],
          ].map(([label, val]) => (
            <div key={label} className="flex gap-3">
              <dt className="w-20 text-gray-400 flex-shrink-0">{label}</dt>
              <dd style={{ color: 'var(--color-basalte)' }}>{val}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Demande */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-400">Contenu de la demande</h2>
        {req.request_reason && (
          <p className="text-sm mb-2">
            <span className="text-gray-400">Motif :</span> <strong>{req.request_reason}</strong>
          </p>
        )}
        <div className="bg-gray-50 rounded-lg p-3 text-sm" style={{ color: 'var(--color-basalte)' }}>
          {req.request_message}
        </div>
        {req.proof_url && (
          <a href={req.proof_url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline mt-2 inline-block">
            Voir la preuve ↗
          </a>
        )}
        {req.listing_slug && (
          <div className="mt-3 flex gap-2">
            <a href={`/lieux/${req.listing_slug}`} target="_blank"
              className="text-xs px-3 py-1.5 rounded border font-medium" style={{ borderColor: '#e2e8f0', color: '#374151' }}>
              Voir la fiche publique ↗
            </a>
            {req.listing_id && (
              <a href={`/admin/listings/${req.listing_id}`}
                className="text-xs px-3 py-1.5 rounded border font-medium" style={{ borderColor: '#e2e8f0', color: '#374151' }}>
                Éditer la fiche ↗
              </a>
            )}
          </div>
        )}
      </div>

      {/* Traitement */}
      <div className="card p-5">
        <h2 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-400">Traitement</h2>
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1.5">Statut</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none"
            style={{ borderColor: '#e2e8f0' }}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1.5">Réponse admin <span className="text-gray-400 font-normal">(interne)</span></label>
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            rows={4}
            placeholder="Notes ou décision interne…"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ borderColor: '#e2e8f0' }}
          />
        </div>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {saved && <p className="text-sm text-green-600 mb-3">Sauvegardé ✓</p>}
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'var(--color-vert)' }}>
            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
          {req.listing_id && ['accepted','applied'].includes(status) && (
            <a href={`/admin/listings/${req.listing_id}`}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'var(--color-lagon)' }}>
              Modifier la fiche
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
