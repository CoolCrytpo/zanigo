import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/session'
import pool from '@/lib/db/client'

export async function POST(req: NextRequest) {
  try {
    await requireSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, string>
  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    body = await req.json()
  } else {
    const fd = await req.formData()
    body = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]))
  }

  const { title, type, asset_url, cta_url, placement, color, bg } = body

  if (!title) {
    return NextResponse.json({ error: 'title required' }, { status: 400 })
  }

  const campaignType = type === 'carousel' ? 'carousel' : 'announcement'

  const target = JSON.stringify({
    placement: placement || 'homepage_top',
    color: color || null,
    bg: bg || null,
  })

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()

  try {
    const result = await pool.query(
      `INSERT INTO campaigns (slug, title, type, asset_url, cta_url, target, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, now(), now())
       RETURNING id`,
      [slug, title, campaignType, asset_url || null, cta_url || null, target]
    )

    const id = result.rows[0].id
    const isForm = contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')
    if (isForm) {
      return NextResponse.redirect(new URL('/admin/encarts', req.url))
    }
    return NextResponse.json({ id })
  } catch (err) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
