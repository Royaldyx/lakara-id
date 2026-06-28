import { query, queryOne } from '~/server/utils/db'
import { requirePortalUser } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const id = getRouterParam(event, 'id')

  const task = await queryOne<any>('SELECT * FROM portal_tasks WHERE id = ?', [id])
  if (!task) throw createError({ statusCode: 404, statusMessage: 'Tugas tidak ditemukan.' })

  const isTeam = user.role === 'staff' || user.role === 'freelancer'
  const isAdmin = user.role === 'admin' || user.role === 'super_admin'

  // Team: hanya assignee yang boleh
  if (isTeam && task.assignee_id !== user.id)
    throw createError({ statusCode: 403, statusMessage: 'Bukan tugas kamu.' })
  if (!isTeam && !isAdmin)
    throw createError({ statusCode: 403, statusMessage: 'Akses ditolak.' })

  // Sembunyikan info klien dari team (privasi)
  if (isTeam) { delete task.client_id; delete task.content_id; delete task.created_by }

  // Enrich nama untuk admin
  let assignee_name = null, company_name = null
  if (isAdmin) {
    if (task.assignee_id) assignee_name = (await queryOne<any>('SELECT name FROM portal_users WHERE id = ?', [task.assignee_id]))?.name
    if (task.client_id) company_name = (await queryOne<any>('SELECT company_name FROM portal_clients WHERE id = ?', [task.client_id]))?.company_name
  }

  const messages = await query<any>(
    `SELECT m.id, m.user_id, m.body, m.attachment, m.created_at, u.name AS sender_name, u.role AS sender_role
     FROM portal_task_messages m LEFT JOIN portal_users u ON u.id = m.user_id
     WHERE m.task_id = ? ORDER BY m.created_at ASC`, [id]
  )

  return { ok: true, task: { ...task, assignee_name, company_name }, messages }
})
