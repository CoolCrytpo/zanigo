import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getPendingContributions } from '@/lib/db/queries'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await getPendingContributions({ per_page: 50 })
  return NextResponse.json(result)
}
