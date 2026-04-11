import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getListingRequestById, updateListingRequest } from '@/lib/ingestion/queries'
import { logAudit } from '@/lib/audit'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const req2 = await getListingRequestById(id)
  if (!req2) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(req2)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const data = await req.json() as {
    status?: string; admin_response?: string;
  }

  const resolved_at = ['accepted', 'rejected', 'applied', 'closed'].includes(data.status ?? '')
    ? new Date().toISOString() : undefined

  await updateListingRequest(id, {
    status: data.status as never,
    admin_response: data.admin_response,
    handled_by: user.id,
    resolved_at,
  })

  try {
    await logAudit({ user_id: user.id, action: 'update', entity_type: 'listing_request', entity_id: id, after: data })
  } catch { /* optional */ }

  return NextResponse.json({ ok: true })
}
