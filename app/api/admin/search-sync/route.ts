import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getPublishedListings } from '@/lib/db/queries'
import { syncAllListings, configureSearchIndex } from '@/lib/search/sync'
import { isSearchEnabled } from '@/lib/search/client'

// POST /api/admin/search-sync
// Reindex all published listings into Meilisearch
export async function POST() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSearchEnabled()) {
    return NextResponse.json({ error: 'Meilisearch not configured' }, { status: 503 })
  }

  try {
    await configureSearchIndex()

    // Fetch all published listings (up to 10k)
    const result = await getPublishedListings({ page: 1, per_page: 10000 })
    await syncAllListings()

    return NextResponse.json({ synced: result.total })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
