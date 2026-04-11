import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined
}

function createPool(): Pool {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')

  const isLocal = url.includes('localhost') || url.includes('127.0.0.1')

  // Supabase pooler uses "postgres.PROJECT_REF" as username which breaks
  // the pg URL parser — use explicit config instead.
  const parsed = new URL(url)
  return new Pool({
    host:     parsed.hostname,
    port:     parseInt(parsed.port) || 5432,
    database: parsed.pathname.replace(/^\//, ''),
    user:     decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  })
}

const pool: Pool = globalThis.__pgPool ?? createPool()
if (process.env.NODE_ENV !== 'production') globalThis.__pgPool = pool

export default pool
