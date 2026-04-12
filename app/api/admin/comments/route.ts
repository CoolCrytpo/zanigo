import { NextResponse } from 'next/server'
import pool from '@/lib/db/client'
import { requireSession } from '@/lib/auth/session'

export async function GET() {
  await requireSession()
  try {
    const result = await pool.query(`
      SELECT lc.*, l.title as listing_title, l.slug as listing_slug
      FROM listing_comments lc
      JOIN listings l ON l.id = lc.listing_id
      WHERE lc.status = 'pending'
      ORDER BY lc.created_at DESC
      LIMIT 50
    `)
    return NextResponse.json({ items: result.rows })
  } catch {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
