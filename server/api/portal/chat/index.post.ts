import { execute } from '~/server/utils/db'
import { requirePortalUser, scopedClientId, genId } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const b = await readBody(event)
  const body = (b.body || '').toString().trim()
  if (!body && !b.attachment) throw createError({ statusCode: 400, statusMessage: 'Pesan kosong.' })

  const clientId = scopedClientId(user, b.client_id)
  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'client_id wajib.' })

  await execute(
    `INSERT INTO portal_chat_messages (id, client_id, sender_user_id, sender_role, body, attachment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [genId('cht'), clientId, user.id, user.role, body || null, b.attachment || null]
  )
  return { ok: true }
})
