import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { upsertListing, getAdminListingById } from '@/lib/db/queries'
import { slugify } from '@/lib/utils'
import { logAudit } from '@/lib/audit'
import { syncListingToSearch } from '@/lib/search/sync'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data = body as Record<string, unknown>
  if (!data.title || !data.type) {
    return NextResponse.json({ error: 'title et type requis' }, { status: 400 })
  }

  // Auto-slug si non fourni
  if (!data.slug) {
    data.slug = slugify(data.title as string)
  }

  try {
    const id = await upsertListing(null, data as Parameters<typeof upsertListing>[1])

    try {
      await logAudit({ user_id: user.id, action: 'create', entity_type: 'listing', entity_id: id, after: data })
    } catch { /* optional */ }

    // Sync to search if published
    if (data.is_published) {
      try {
        const listing = await getAdminListingById(id)
        if (listing) await syncListingToSearch(listing)
      } catch { /* optional */ }
    }

    return NextResponse.json({ id })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
