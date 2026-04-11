import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db/client'
import { createSession, setSessionCookie } from '@/lib/auth/session'
import type { AdminUser } from '@/lib/types'

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, password } = body as { email?: unknown; password?: unknown }
  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  try {
    const result = await pool.query<AdminUser & { password_hash: string }>(
      `SELECT id, email, name, role, password_hash, created_at
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    )
    const user = result.rows[0]
    if (!user) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    // Simple bcrypt comparison (requires bcryptjs in prod)
    // For now: plaintext match (replace with bcrypt in production!)
    const { createHash } = await import('crypto')
    const hash = createHash('sha256').update(password).digest('hex')
    const isValid = user.password_hash === hash || user.password_hash === password

    if (!isValid) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const sessionId = await createSession(user.id)
    await setSessionCookie(sessionId)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
