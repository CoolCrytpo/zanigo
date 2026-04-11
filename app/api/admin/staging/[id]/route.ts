import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getStagingById, updateStaging, approveStagingItem, rejectStagingItem } from '@/lib/ingestion/queries'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const item = await getStagingById(id)
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const data = await req.json()
  await updateStaging(id, data)
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest, { params }: Params) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { action, reason } = await req.json() as { action: 'approve' | 'reject'; reason?: string }

  if (action === 'approve') {
    const listingId = await approveStagingItem(id, user.id)
    return NextResponse.json({ ok: true, listing_id: listingId })
  }
  if (action === 'reject') {
    await rejectStagingItem(id, user.id, reason ?? 'Non spécifié')
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
}
