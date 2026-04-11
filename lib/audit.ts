import pool from '@/lib/db/client'

interface AuditParams {
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  before?: unknown
  after?: unknown
}

export async function logAudit(params: AuditParams): Promise<void> {
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, before, after)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      params.user_id,
      params.action,
      params.entity_type,
      params.entity_id,
      params.before ? JSON.stringify(params.before) : null,
      params.after ? JSON.stringify(params.after) : null,
    ]
  )
}
