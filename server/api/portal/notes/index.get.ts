import { query } from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/portal'

const ENTITIES = ['client', 'brief', 'content', 'ticket']

export default defineEventHandler(async (event) => {
  await requireAdmin(event) // hanya admin/super_admin — JANGAN pernah expose ke client
  const q = getQuery(event)
  const entityType = (q.entity_type || '').toString()
  const entityId = (q.entity_id || '').toString()
  if (!ENTITIES.includes(entityType) || !entityId)
    throw createError({ statusCode: 400, statusMessage: 'entity_type/entity_id tidak valid.' })

  const rows = await query<any>(
    `SELECT n.id, n.body, n.created_at, u.name AS author
     FROM portal_notes n LEFT JOIN portal_users u ON u.id = n.created_by
     WHERE n.entity_type = ? AND n.entity_id = ?
     ORDER BY n.created_at DESC`,
    [entityType, entityId]
  )
  return { ok: true, data: rows }
})
