import { query, execute } from '~/server/utils/db'
import { requirePortalUser, scopedClientId } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const clientId = scopedClientId(user, (getQuery(event).client_id || '').toString())
  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'client_id wajib.' })

  const rows = await query<any>(
    `SELECT id, sender_user_id, sender_role, body, attachment, read_at, created_at
     FROM portal_chat_messages WHERE client_id = ? ORDER BY created_at ASC LIMIT 200`, [clientId]
  )

  // Tandai pesan dari pihak lawan sebagai terbaca
  const otherSide = user.role === 'client' ? "sender_role != 'client'" : "sender_role = 'client'"
  await execute(
    `UPDATE portal_chat_messages SET read_at = NOW() WHERE client_id = ? AND read_at IS NULL AND ${otherSide}`,
    [clientId]
  )

  return { ok: true, data: rows }
})
