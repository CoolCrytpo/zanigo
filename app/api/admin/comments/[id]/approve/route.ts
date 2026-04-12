import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/client'
import { requireSession } from '@/lib/auth/session'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireSession()
  const { id } = await params
  try {
    await pool.query(`UPDATE listing_comments SET status = 'approved' WHERE id = $1`, [id])
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
