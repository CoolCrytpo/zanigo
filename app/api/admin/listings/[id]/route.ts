import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getAdminListingById, upsertListing } from '@/lib/db/queries'
import { logAudit } from '@/lib/audit'
import { syncListingToSearch, removeListingFromSearch } from '@/lib/search/sync'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const listing = await getAdminListingById(id)
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(listing)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data = body as Record<string, unknown>

  try {
    const before = await getAdminListingById(id)
    await upsertListing(id, data as Parameters<typeof upsertListing>[1])

    try {
      await logAudit({ user_id: user.id, action: 'update', entity_type: 'listing', entity_id: id, before, after: data })
    } catch { /* optional */ }

    // Sync search
    try {
      if (data.is_published) {
        const updated = await getAdminListingById(id)
        if (updated) await syncListingToSearch(updated.id)
      } else {
        await removeListingFromSearch(id)
      }
    } catch { /* optional */ }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
