'use client'
import { useState } from 'react'

interface Props { listingId: string }

export function CommentForm({ listingId }: Props) {
  const [pseudo, setPseudo] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (content.length < 5) return
    setStatus('sending')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, pseudo: pseudo || null, content }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch { setStatus('error') }
  }

  if (status === 'done') {
    return (
      <div className="p-4 rounded-xl text-sm text-center" style={{ background: 'var(--color-vert-light)', color: 'var(--color-vert)' }}>
        Merci ! Votre témoignage sera visible après modération.
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Pseudo (optionnel)"
        value={pseudo}
        onChange={e => setPseudo(e.target.value)}
        maxLength={50}
        className="w-full text-sm px-3 py-2 rounded-xl border focus:outline-none"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-canvas)' }}
      />
      <textarea
        placeholder="Votre expérience avec cet endroit... (5 à 1000 caractères)"
        value={content}
        onChange={e => setContent(e.target.value)}
        minLength={5}
        maxLength={1000}
        rows={3}
        required
        className="w-full text-sm px-3 py-2 rounded-xl border focus:outline-none resize-none"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-canvas)' }}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {content.length}/1000 — visible après modération
        </p>
        <button
          type="submit"
          disabled={status === 'sending' || content.length < 5}
          className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--color-vert)', opacity: (status === 'sending' || content.length < 5) ? 0.6 : 1 }}
        >
          {status === 'sending' ? 'Envoi…' : 'Partager'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs" style={{ color: '#dc2626' }}>Une erreur est survenue. Réessayez.</p>
      )}
    </form>
  )
}
