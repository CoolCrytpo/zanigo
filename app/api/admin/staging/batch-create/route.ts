import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/session'
import { getStagingById, approveStagingItem } from '@/lib/ingestion/queries'

export async function POST(req: NextRequest) {
  const user = await requireSession()
  const { ids } = await req.json() as { ids: string[] }
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids required' }, { status: 400 })
  }

  const results: { id: string; status: 'created' | 'error'; listing_id?: string; error?: string }[] = []

  for (const id of ids) {
    try {
      const staging = await getStagingById(id)
      if (!staging) { results.push({ id, status: 'error', error: 'Not found' }); continue }
      if (staging.status === 'published') { results.push({ id, status: 'error', error: 'Already published' }); continue }

      const listingId = await approveStagingItem(id, user.id)
      results.push({ id, status: 'created', listing_id: listingId })
    } catch (e) {
      results.push({ id, status: 'error', error: e instanceof Error ? e.message : 'Unknown error' })
    }
  }

  const created = results.filter(r => r.status === 'created').length
  const errors = results.filter(r => r.status === 'error').length
  return NextResponse.json({ created, errors, results })
}
