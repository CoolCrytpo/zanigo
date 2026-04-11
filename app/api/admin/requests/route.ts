import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getListingRequests } from '@/lib/ingestion/queries'

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const result = await getListingRequests({
    status: sp.get('status') ?? undefined,
    type: sp.get('type') ?? undefined,
    page: parseInt(sp.get('page') ?? '1'),
  })
  return NextResponse.json(result)
}
