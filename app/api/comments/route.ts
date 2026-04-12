import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/client'

export async function POST(req: NextRequest) {
  try {
    const { listing_id, pseudo, content } = await req.json() as {
      listing_id: string
      pseudo: string | null
      content: string
    }
    if (!listing_id || !content || content.length < 5 || content.length > 1000) {
      return NextResponse.json({ error: 'Invalid' }, { status: 400 })
    }
    await pool.query(
      `INSERT INTO listing_comments (listing_id, pseudo, content, status) VALUES ($1, $2, $3, 'pending')`,
      [listing_id, pseudo || null, content]
    )
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
