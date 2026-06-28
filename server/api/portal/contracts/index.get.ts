import { query } from '~/server/utils/db'
import { requirePortalUser } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)

  if (user.role === 'staff' || user.role === 'freelancer') {
    const rows = await query<any>(
      `SELECT id, title, file_path, rate_type, rate, scope, start_date, end_date, status, created_at
       FROM portal_contracts WHERE user_id = ? ORDER BY created_at DESC`, [user.id]
    )
    return { ok: true, data: rows }
  }

  if (user.role === 'admin' || user.role === 'super_admin') {
    const uid = (getQuery(event).user_id || '').toString()
    const rows = await query<any>(
      `SELECT c.*, u.name AS member_name, u.role AS member_role
       FROM portal_contracts c JOIN portal_users u ON u.id = c.user_id
       ${uid ? 'WHERE c.user_id = ?' : ''} ORDER BY c.created_at DESC`,
      uid ? [uid] : []
    )
    return { ok: true, data: rows }
  }
  throw createError({ statusCode: 403, statusMessage: 'Akses ditolak.' })
})
