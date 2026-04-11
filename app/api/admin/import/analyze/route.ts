import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { analyzeUrls } from '@/lib/ingestion/extractor'

// POST /api/admin/import/analyze
// Body: { urls: string[] }
export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { urls } = await req.json() as { urls: string[] }
  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: 'urls requis' }, { status: 400 })
  }
  if (urls.length > 20) {
    return NextResponse.json({ error: 'Maximum 20 URLs par analyse' }, { status: 400 })
  }

  const results = await analyzeUrls(urls)
  return NextResponse.json({ results })
}
