import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Bot/scraper UA patterns
const BOT_PATTERNS = [
  /bot\b/i, /crawler/i, /spider/i, /scraper/i, /wget/i, /python-requests/i,
  /axios\/[0-9]/i, /java\/[0-9]/i, /curl\//i, /scrapy/i, /httrack/i,
  /phantomjs/i, /headlesschrome/i, /puppeteer/i, /playwright/i,
]

// Per-instance rate limiter (resets on cold start — intentionally stateless)
const RL = new Map<string, { n: number; exp: number }>()

function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = RL.get(key)
  if (!entry || entry.exp < now) {
    RL.set(key, { n: 1, exp: now + windowMs })
    return false
  }
  entry.n++
  return entry.n > max
}

// Clean stale entries occasionally
const g = globalThis as typeof globalThis & { __rl_clean?: ReturnType<typeof setInterval> }
if (!g.__rl_clean) {
  g.__rl_clean = setInterval(() => {
    const now = Date.now()
    for (const [k, v] of RL.entries()) if (v.exp < now) RL.delete(k)
  }, 60_000)
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Only protect API routes
  if (!pathname.startsWith('/api/')) return NextResponse.next()

  const ua = req.headers.get('user-agent') ?? ''
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'

  // Block obvious bots/scrapers on API
  if (BOT_PATTERNS.some(p => p.test(ua)) && !pathname.startsWith('/api/admin/')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Rate limits per route category
  let max = 120; let window = 60_000
  if (pathname.startsWith('/api/contributions'))    { max = 5;   window = 60_000 }
  else if (pathname.startsWith('/api/reactions/'))  { max = 40;  window = 60_000 }
  else if (pathname.startsWith('/api/search'))      { max = 80;  window = 60_000 }
  else if (pathname.startsWith('/api/upload'))      { max = 10;  window = 60_000 }
  else if (pathname.startsWith('/api/admin/'))      { max = 300; window = 60_000 }

  const bucket = pathname.startsWith('/api/admin/') ? 'admin' : pathname.split('/').slice(0, 3).join('/')
  const key = `${ip}:${bucket}`

  if (rateLimit(key, max, window)) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une minute.' },
      { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Limit': String(max) } }
    )
  }

  // Add security headers to all API responses
  const res = NextResponse.next()
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  return res
}

export const config = { matcher: '/api/:path*' }
