'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { StagingListing } from '@/lib/ingestion/types'

const POLICY_LABELS = { yes: '✅ Acceptés', no: '❌ Refusés', conditional: '⚠️ Conditionnels', unknown: '❓ Inconnu' }
const POLICY_COLORS = { yes: '#16a34a', no: '#dc2626', conditional: '#d97706', unknown: '#9ca3af' }

export default function StagingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [item, setItem] = useState<StagingListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/staging/${id}`)
      .then(r => r.json())
      .then(data => { setItem(data); setNotes(data.admin_notes ?? '') })
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [id])

  const saveNotes = async () => {
    setSaving(true)
    await fetch(`/api/admin/staging/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes: notes }),
    })
    setSaving(false)
  }

  const doAction = async (act: 'approve' | 'reject') => {
    if (act === 'reject' && !rejectReason) { setError('Motif requis'); return }
    setSaving(true); setError(null)
    try {
      const res = await fetch(`/api/admin/staging/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: act, reason: rejectReason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (act === 'approve' && data.listing_id) router.push(`/admin/listings/${data.listing_id}`)
      else router.push('/admin/staging')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
      setSaving(false)
    }
  }

  if (loading) return <div className="text-sm text-gray-400 p-6">Chargement…</div>
  if (!item) return <div className="text-sm text-red-500 p-6">Pré-fiche introuvable</div>

  const dogPolicy = item.dog_policy as keyof typeof POLICY_LABELS

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/staging" className="text-sm text-gray-400 hover:underline">← Staging</a>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
          {item.name}
        </h1>
        <span className="ml-auto text-xs px-2 py-1 rounded text-white font-medium"
          style={{ background: item.confidence_score >= 70 ? '#16a34a' : item.confidence_score >= 50 ? '#d97706' : '#dc2626' }}>
          Confiance : {item.confidence_score}%
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-5">
        {/* Info principale */}
        <div className="card p-5">
          <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-400">Informations</h2>
          <dl className="flex flex-col gap-2 text-sm">
            {[
              ['Catégorie', item.category ?? '—'],
              ['Commune', item.commune_name ?? '—'],
              ['Adresse', item.address ?? '—'],
              ['Téléphone', item.phone ?? '—'],
              ['Email', item.email ?? '—'],
              ['Site web', item.website ?? '—'],
            ].map(([label, val]) => (
              <div key={label} className="flex gap-2">
                <dt className="w-24 text-gray-400 flex-shrink-0">{label}</dt>
                <dd style={{ color: 'var(--color-basalte)' }}>{val}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Policy chien */}
        <div className="card p-5">
          <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-400">Policy chien</h2>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold px-3 py-1 rounded-full text-white"
              style={{ background: POLICY_COLORS[dogPolicy] ?? '#9ca3af' }}>
              {POLICY_LABELS[dogPolicy] ?? item.dog_policy}
            </span>
          </div>
          {item.dog_policy_detail && <p className="text-sm text-gray-600">{item.dog_policy_detail}</p>}
          {item.proof_excerpt && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
              <p className="text-xs font-semibold text-amber-700 mb-1">Preuve extraite</p>
              <p className="text-xs text-amber-800 italic">"{item.proof_excerpt}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Source */}
      <div className="card p-4 mb-4">
        <h2 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-400">Source</h2>
        <div className="flex gap-4 text-sm flex-wrap">
          <span className="text-gray-500">Domaine : <strong>{item.source_domain ?? '—'}</strong></span>
          <span className="text-gray-500">Type : <strong>{item.source_page_type ?? '—'}</strong></span>
          {item.source_url && (
            <a href={item.source_url} target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs">Ouvrir la source ↗</a>
          )}
        </div>
        {item.dedupe_key && <p className="text-xs text-gray-400 mt-1">Clé déduplication : <code>{item.dedupe_key}</code></p>}
      </div>

      {/* Doublon */}
      {item.duplicate_of_listing_id && (
        <div className="card p-4 mb-4 border-amber-200" style={{ borderColor: '#fde68a', background: '#fffbeb' }}>
          <h2 className="font-semibold mb-1 text-sm text-amber-700">⚠️ Doublon probable détecté</h2>
          <p className="text-sm text-amber-600">Score de similarité : {item.duplicate_score}%</p>
          <a href={`/admin/listings/${item.duplicate_of_listing_id}`} target="_blank"
            className="text-xs text-amber-700 underline">Voir la fiche existante ↗</a>
        </div>
      )}

      {/* Notes admin */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-400">Notes admin</h2>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Notes internes (non publiées)…"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={{ borderColor: '#e2e8f0' }}
        />
        <button onClick={saveNotes} disabled={saving}
          className="mt-2 text-xs px-3 py-1.5 rounded border font-medium disabled:opacity-50"
          style={{ borderColor: '#e2e8f0', color: '#374151' }}>
          {saving ? 'Sauvegarde…' : 'Sauvegarder notes'}
        </button>
      </div>

      {/* Actions */}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {item.status !== 'published' && item.status !== 'rejected' && (
        <div className="flex flex-col gap-3">
          {action === 'reject' ? (
            <div className="card p-4">
              <label className="text-sm font-medium block mb-2">Motif de rejet</label>
              <select value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
                style={{ borderColor: '#e2e8f0' }}>
                <option value="">Choisir un motif…</option>
                {['Hors périmètre','Données insuffisantes','Doublon sans valeur ajoutée','Policy négative confirmée','Source non fiable','Erreur de parsing'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button onClick={() => doAction('reject')} disabled={saving || !rejectReason}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: '#dc2626' }}>
                  Confirmer le rejet
                </button>
                <button onClick={() => setAction(null)} className="px-4 py-2 rounded-lg text-sm border"
                  style={{ borderColor: '#e2e8f0' }}>Annuler</button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => doAction('approve')} disabled={saving}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'var(--color-vert)' }}>
                ✅ Approuver & créer fiche
              </button>
              <button onClick={() => setAction('reject')} disabled={saving}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{ background: '#dc2626' }}>
                ❌ Rejeter
              </button>
            </div>
          )}
        </div>
      )}

      {item.status === 'published' && item.published_listing_id && (
        <a href={`/admin/listings/${item.published_listing_id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'var(--color-vert)' }}>
          Voir la fiche publiée ↗
        </a>
      )}

      {item.status === 'rejected' && (
        <div className="text-sm text-red-600">
          Rejeté — {item.rejection_reason}
        </div>
      )}
    </div>
  )
}
