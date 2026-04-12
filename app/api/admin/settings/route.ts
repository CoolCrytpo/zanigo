import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/session'
import pool from '@/lib/db/client'

export async function GET() {
  try {
    await requireSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await pool.query(
      `SELECT key, value FROM app_settings ORDER BY key`
    )
    // Serialize JSONB values to strings for consistent client handling
    const settings = result.rows.map(r => ({
      key: r.key,
      value: JSON.stringify(r.value),
    }))
    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ settings: [] })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { key?: string; value?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { key, value } = body
  if (!key || value === undefined) {
    return NextResponse.json({ error: 'key and value required' }, { status: 400 })
  }

  // Parse string to proper JSON type before storing as JSONB
  function parseValue(v: string): unknown {
    if (v === 'true') return true
    if (v === 'false') return false
    const n = Number(v)
    if (!isNaN(n) && v.trim() !== '') return n
    return v
  }

  try {
    await pool.query(
      `UPDATE app_settings SET value = $2::jsonb, updated_at = now() WHERE key = $1`,
      [key, JSON.stringify(parseValue(String(value)))]
    )
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
