import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getStagingListings } from '@/lib/ingestion/queries'

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const result = await getStagingListings({
    status: sp.get('status') ?? undefined,
    batch_id: sp.get('batch_id') ?? undefined,
    commune: sp.get('commune') ?? undefined,
    q: sp.get('q') ?? undefined,
    duplicate_only: sp.get('duplicate_only') === 'true',
    page: parseInt(sp.get('page') ?? '1'),
    per_page: 30,
  })
  return NextResponse.json(result)
}
