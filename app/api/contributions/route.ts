import { NextRequest, NextResponse } from 'next/server'
import { createContribution } from '@/lib/db/queries'

const VALID_TYPES = ['new_listing', 'correction', 'report']

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, data, listing_id, submitter_anon } = body as {
    type?: unknown
    data?: unknown
    listing_id?: unknown
    submitter_anon?: unknown
  }

  if (!VALID_TYPES.includes(type as string) || !data || typeof data !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  try {
    const id = await createContribution({
      listing_id: typeof listing_id === 'string' ? listing_id : undefined,
      type: type as string,
      data: data as Record<string, unknown>,
      submitter_anon: typeof submitter_anon === 'string' ? submitter_anon.slice(0, 64) : undefined,
    })
    return NextResponse.json({ id })
  } catch {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
