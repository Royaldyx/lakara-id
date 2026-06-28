import { query } from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  // Daftar klien yang punya percakapan + pesan terakhir + unread dari client.
  // Pakai subquery (bukan GROUP BY/HAVING) agar aman dari ONLY_FULL_GROUP_BY.
  const rows = await query<any>(
    `SELECT * FROM (
       SELECT c.id AS client_id, c.company_name,
         (SELECT body FROM portal_chat_messages m WHERE m.client_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
         (SELECT created_at FROM portal_chat_messages m WHERE m.client_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_at,
         (SELECT COUNT(*) FROM portal_chat_messages m WHERE m.client_id = c.id AND m.sender_role = 'client' AND m.read_at IS NULL) AS unread
       FROM portal_clients c
     ) t
     WHERE t.last_at IS NOT NULL
     ORDER BY t.last_at DESC`
  )
  return { ok: true, data: rows }
})
