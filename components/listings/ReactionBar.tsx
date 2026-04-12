'use client'
import { useState, useEffect, useCallback } from 'react'
import { ThumbsUp, Heart, Star, Flag } from 'lucide-react'

interface Props { listingId: string; compact?: boolean }

type Counts = { useful: number; thanks: number; love: number; oops: number }

const REACTIONS = [
  { key: 'useful', Icon: ThumbsUp,      label: 'Utile' },
  { key: 'thanks', Icon: Heart,          label: 'Merci' },
  { key: 'love',   Icon: Star,           label: "J'adore" },
  { key: 'oops',   Icon: Flag,           label: 'Signaler' },
] as const

function getAnonHash(): string {
  if (typeof window === 'undefined') return 'anon'
  const k = 'zg_anon'
  let h = localStorage.getItem(k)
  if (!h) { h = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(k, h) }
  return h
}

export function ReactionBar({ listingId, compact = true }: Props) {
  const [counts, setCounts] = useState<Counts>({ useful: 0, thanks: 0, love: 0, oops: 0 })
  const [active, setActive] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const k = `zg_reaction_${listingId}`
    setActive(localStorage.getItem(k))
    fetch(`/api/reactions/${listingId}`)
      .then(r => r.json())
      .then(d => setCounts(d))
      .catch(() => {})
  }, [listingId])

  const react = useCallback(async (type: string) => {
    if (loading) return
    setLoading(true)
    const k = `zg_reaction_${listingId}`
    const prev = active
    const action = prev === type ? 'remove' : 'add'
    const newActive = action === 'add' ? type : null

    setActive(newActive)
    if (newActive) localStorage.setItem(k, newActive)
    else localStorage.removeItem(k)

    setCounts(c => {
      const next = { ...c }
      if (action === 'add') next[type as keyof Counts] = (next[type as keyof Counts] || 0) + 1
      else next[type as keyof Counts] = Math.max(0, (next[type as keyof Counts] || 1) - 1)
      if (prev && prev !== type) next[prev as keyof Counts] = Math.max(0, (next[prev as keyof Counts] || 1) - 1)
      return next
    })

    try {
      await fetch(`/api/reactions/${listingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, anonHash: getAnonHash(), action }),
      })
      if (prev && prev !== type) {
        await fetch(`/api/reactions/${listingId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: prev, anonHash: getAnonHash(), action: 'remove' }),
        })
      }
    } catch { /* optimistic update stays */ }
    finally { setLoading(false) }
  }, [listingId, active, loading])

  void compact

  return (
    <div className="flex items-center gap-1" onClick={e => e.preventDefault()}>
      {REACTIONS.map(({ key, Icon, label }) => {
        const count = counts[key as keyof Counts]
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => react(key)}
            title={label}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background: isActive ? (key === 'oops' ? '#FEE2E2' : key === 'love' ? '#FFF8E6' : '#EEF4FF') : 'transparent',
              color: isActive ? (key === 'oops' ? '#EF4444' : key === 'love' ? '#F4B73F' : '#2A74E6') : 'var(--color-muted)',
              border: `1px solid ${isActive ? 'transparent' : 'var(--color-border)'}`,
              transform: loading ? 'scale(0.95)' : 'scale(1)',
            }}
          >
            <Icon size={12} strokeWidth={isActive ? 2.5 : 1.75} fill={isActive && key !== 'oops' ? 'currentColor' : 'none'} />
            {count > 0 && <span>{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
