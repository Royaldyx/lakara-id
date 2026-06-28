import { execute } from '~/server/utils/db'
import { requireAdmin, genId, logActivity } from '~/server/utils/portal'

const ENTITIES = ['client', 'brief', 'content', 'ticket']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const b = await readBody(event)
  const entityType = (b.entity_type || '').toString()
  const entityId = (b.entity_id || '').toString()
  const body = (b.body || '').toString().trim()

  if (!ENTITIES.includes(entityType) || !entityId)
    throw createError({ statusCode: 400, statusMessage: 'entity_type/entity_id tidak valid.' })
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Catatan kosong.' })

  const id = genId('note')
  await execute(
    'INSERT INTO portal_notes (id, entity_type, entity_id, body, created_by) VALUES (?, ?, ?, ?, ?)',
    [id, entityType, entityId, body, admin.id]
  )
  await logActivity(event, admin, 'add_note', entityType, entityId)
  return { ok: true, id }
})
