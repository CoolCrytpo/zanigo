import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { updateContributionStatus } from '@/lib/db/queries'
import type { ContributionStatus } from '@/lib/types'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { status } = await req.json() as { status: ContributionStatus }
  const VALID = ['approved', 'rejected', 'merged']
  if (!VALID.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  await updateContributionStatus(id, status, user.id)
  return NextResponse.json({ ok: true })
}
