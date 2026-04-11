import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { rejectStagingItem } from '@/lib/ingestion/queries'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ids, action, reason } = await req.json() as {
    ids: string[]
    action: 'reject'
    reason?: string
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids requis' }, { status: 400 })
  }
  if (action !== 'reject') {
    return NextResponse.json({ error: 'Action non supportée' }, { status: 400 })
  }

  let done = 0
  for (const id of ids) {
    try {
      await rejectStagingItem(id, user.id, reason ?? 'Rejet en masse')
      done++
    } catch { /* skip */ }
  }

  return NextResponse.json({ done, total: ids.length })
}
