'use client'

import { useState, useEffect, useCallback } from 'react'
import { REACTION_EMOJIS, REACTION_LABELS } from '@/config/constants'
import type { ReactionCounts, ReactionType } from '@/lib/types'

const REACTION_TYPES: ReactionType[] = ['useful', 'thanks', 'love', 'oops']

function getAnonHash(): string {
  const key = 'zanigo_anon'
  let hash = localStorage.getItem(key)
  if (!hash) {
    hash = crypto.randomUUID().replace(/-/g, '')
    localStorage.setItem(key, hash)
  }
  return hash
}

function getLocalReacted(listingId: string): Set<ReactionType> {
  try {
    const raw = localStorage.getItem(`zanigo_reacted_${listingId}`)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as ReactionType[])
  } catch {
    return new Set()
  }
}

function saveLocalReacted(listingId: string, reacted: Set<ReactionType>) {
  localStorage.setItem(`zanigo_reacted_${listingId}`, JSON.stringify([...reacted]))
}

interface Props {
  listingId: string
  initialCounts: ReactionCounts
}

export function ReactionBar({ listingId, initialCounts }: Props) {
  const [counts, setCounts] = useState<ReactionCounts>(initialCounts)
  const [reacted, setReacted] = useState<Set<ReactionType>>(new Set())
  const [pending, setPending] = useState<ReactionType | null>(null)

  useEffect(() => {
    setReacted(getLocalReacted(listingId))
  }, [listingId])

  const toggle = useCallback(async (type: ReactionType) => {
    if (pending) return

    const anonHash = getAnonHash()
    const isReacted = reacted.has(type)
    const action = isReacted ? 'remove' : 'add'

    // Optimistic update
    setPending(type)
    const prev = { ...counts }
    const newReacted = new Set(reacted)
    setCounts((c) => ({
      ...c,
      [type]: Math.max(0, c[type] + (isReacted ? -1 : 1)),
    }))
    if (isReacted) newReacted.delete(type)
    else newReacted.add(type)
    setReacted(newReacted)
    saveLocalReacted(listingId, newReacted)

    try {
      const res = await fetch(`/api/reactions/${listingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, anonHash, action }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json() as ReactionCounts
      setCounts(updated)
    } catch {
      // Rollback
      setCounts(prev)
      const rollback = new Set(reacted)
      setReacted(rollback)
      saveLocalReacted(listingId, rollback)
    } finally {
      setPending(null)
    }
  }, [listingId, counts, reacted, pending])

  return (
    <div className="flex flex-wrap gap-2">
      {REACTION_TYPES.map((type) => {
        const isActive = reacted.has(type)
        const isPending = pending === type
        return (
          <button
            key={type}
            onClick={() => void toggle(type)}
            disabled={!!pending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all disabled:opacity-60"
            style={{
              borderColor: isActive ? 'var(--color-vert)' : 'var(--color-border)',
              background: isActive ? 'var(--color-vert-light)' : '#fff',
              color: isActive ? 'var(--color-vert)' : 'var(--color-muted)',
              transform: isPending ? 'scale(0.96)' : 'scale(1)',
            }}
            title={REACTION_LABELS[type]}
          >
            <span>{REACTION_EMOJIS[type]}</span>
            <span>{counts[type] > 0 ? counts[type] : ''}</span>
          </button>
        )
      })}
    </div>
  )
}
