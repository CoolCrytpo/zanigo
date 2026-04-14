import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/session'
import pool from '@/lib/db/client'

export async function POST(req: NextRequest) {
  try {
    await requireSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Toggle activation via query param (called from table form)
  const url = new URL(req.url)
  const toggleId = url.searchParams.get('id')
  const isToggle = url.searchParams.get('toggle') === '1'

  if (isToggle && toggleId) {
    try {
      await pool.query(
        `UPDATE campaigns SET is_active = NOT is_active, updated_at = now() WHERE id = $1`,
        [toggleId]
      )
      return NextResponse.redirect(new URL('/admin/events', req.url))
    } catch (err) {
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }
  }

  let body: Record<string, string>
  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    body = await req.json()
  } else {
    const fd = await req.formData()
    body = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]))
  }

  const { title, advertiser, asset_url, cta_url, event_date, event_end_date, location } = body

  if (!title) {
    return NextResponse.json({ error: 'title required' }, { status: 400 })
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()

  try {
    const target = JSON.stringify({
      event_date: event_date || null,
      event_end_date: event_end_date || null,
      location: location || null,
    })

    const result = await pool.query(
      `INSERT INTO campaigns (slug, title, advertiser, type, asset_url, cta_url, target, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, 'event', $4, $5, $6, true, now(), now())
       RETURNING id`,
      [slug, title, advertiser || 'Zanimo Guide', asset_url || null, cta_url || null, target]
    )

    const id = result.rows[0].id
    const isForm = contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')
    if (isForm) {
      return NextResponse.redirect(new URL('/admin/events', req.url))
    }
    return NextResponse.json({ id })
  } catch (err) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
