import { query, queryOne } from '~/server/utils/db'
import { requirePortalUser } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const onlyUnread = getQuery(event).unread === '1'

  const rows = await query<any>(
    `SELECT id, type, title, body, link, read_at, created_at
     FROM portal_notifications
     WHERE user_id = ? ${onlyUnread ? 'AND read_at IS NULL' : ''}
     ORDER BY created_at DESC LIMIT 50`,
    [user.id]
  )
  const unread = await queryOne<any>(
    'SELECT COUNT(*) AS n FROM portal_notifications WHERE user_id = ? AND read_at IS NULL',
    [user.id]
  )

  return { ok: true, data: rows, unread: Number(unread?.n || 0) }
})
