import { query } from '~/server/utils/db'
import { requirePortalUser } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)

  if (user.role === 'staff' || user.role === 'freelancer') {
    const rows = await query<any>(
      `SELECT id, period_start, period_end, amount, status, paid_at, notes, created_at
       FROM portal_payouts WHERE user_id = ? ORDER BY created_at DESC`, [user.id]
    )
    return { ok: true, data: rows }
  }

  if (user.role === 'admin' || user.role === 'super_admin') {
    const status = (getQuery(event).status || '').toString()
    const rows = await query<any>(
      `SELECT p.*, u.name AS member_name, u.role AS member_role
       FROM portal_payouts p JOIN portal_users u ON u.id = p.user_id
       ${status ? 'WHERE p.status = ?' : ''} ORDER BY p.created_at DESC`,
      status ? [status] : []
    )
    return { ok: true, data: rows }
  }
  throw createError({ statusCode: 403, statusMessage: 'Akses ditolak.' })
})
