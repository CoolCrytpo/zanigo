import { NextRequest, NextResponse } from 'next/server'
import { getReactionCounts, addReaction, removeReaction } from '@/lib/db/queries'
import type { ReactionType } from '@/lib/types'

const VALID_TYPES = new Set<ReactionType>(['useful', 'thanks', 'love', 'oops'])

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { listingId } = await params
  try {
    const counts = await getReactionCounts(listingId)
    return NextResponse.json(counts)
  } catch {
    return NextResponse.json({ useful: 0, thanks: 0, love: 0, oops: 0 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { listingId } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, anonHash, action } = body as {
    type?: unknown
    anonHash?: unknown
    action?: unknown
  }

  if (
    !VALID_TYPES.has(type as ReactionType) ||
    typeof anonHash !== 'string' ||
    !['add', 'remove'].includes(action as string)
  ) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const safeHash = (anonHash as string).slice(0, 64)

  try {
    if (action === 'add') {
      await addReaction(listingId, type as ReactionType, safeHash)
    } else {
      await removeReaction(listingId, type as ReactionType, safeHash)
    }
    const counts = await getReactionCounts(listingId)
    return NextResponse.json(counts)
  } catch {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
