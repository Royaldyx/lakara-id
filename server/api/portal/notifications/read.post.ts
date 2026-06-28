import { execute } from '~/server/utils/db'
import { requirePortalUser } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const body = await readBody(event)

  if (body.all) {
    await execute('UPDATE portal_notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL', [user.id])
  } else if (body.id) {
    await execute('UPDATE portal_notifications SET read_at = NOW() WHERE id = ? AND user_id = ?', [body.id, user.id])
  }
  return { ok: true }
})
