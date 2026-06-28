import { query } from '~/server/utils/db'
import { requirePortalUser } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const q = getQuery(event)

  // Team: hanya laporan sendiri
  if (user.role === 'staff' || user.role === 'freelancer') {
    const rows = await query<any>(
      `SELECT id, report_date, summary, hours, links, created_at
       FROM portal_daily_reports WHERE user_id = ? ORDER BY report_date DESC, created_at DESC LIMIT 90`,
      [user.id]
    )
    return { ok: true, data: rows }
  }

  // Admin: rekap semua + filter
  if (user.role === 'admin' || user.role === 'super_admin') {
    const where: string[] = []
    const params: any[] = []
    if (q.user_id) { where.push('r.user_id = ?'); params.push(q.user_id) }
    if (q.date)    { where.push('r.report_date = ?'); params.push(q.date) }
    const rows = await query<any>(
      `SELECT r.id, r.user_id, r.report_date, r.summary, r.hours, r.links, r.created_at,
              u.name AS author, u.role AS author_role
       FROM portal_daily_reports r JOIN portal_users u ON u.id = r.user_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY r.report_date DESC, r.created_at DESC LIMIT 200`, params
    )
    return { ok: true, data: rows }
  }

  throw createError({ statusCode: 403, statusMessage: 'Akses ditolak.' })
})
