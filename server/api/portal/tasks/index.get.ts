import { query } from '~/server/utils/db'
import { requirePortalUser } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const status = (getQuery(event).status || '').toString()

  // Team (staff/freelancer): hanya tugas miliknya, TANPA info klien
  if (user.role === 'staff' || user.role === 'freelancer') {
    const rows = await query<any>(
      `SELECT id, title, type, status, deadline, fee, deliverable, submitted_at, created_at, updated_at
       FROM portal_tasks
       WHERE assignee_id = ? ${status ? 'AND status = ?' : ''}
       ORDER BY (status = 'done'), deadline IS NULL, deadline ASC, created_at DESC`,
      status ? [user.id, status] : [user.id]
    )
    return { ok: true, data: rows }
  }

  // Admin: semua tugas + nama assignee + nama klien
  if (user.role === 'admin' || user.role === 'super_admin') {
    const rows = await query<any>(
      `SELECT t.id, t.title, t.type, t.status, t.deadline, t.fee, t.deliverable, t.submitted_at, t.created_at,
              t.assignee_id, u.name AS assignee_name, u.role AS assignee_role,
              t.client_id, c.company_name
       FROM portal_tasks t
       LEFT JOIN portal_users u ON u.id = t.assignee_id
       LEFT JOIN portal_clients c ON c.id = t.client_id
       ${status ? 'WHERE t.status = ?' : ''}
       ORDER BY t.created_at DESC`,
      status ? [status] : []
    )
    return { ok: true, data: rows }
  }

  throw createError({ statusCode: 403, statusMessage: 'Akses ditolak.' })
})
