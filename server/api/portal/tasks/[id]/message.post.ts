import { queryOne, execute } from '~/server/utils/db'
import { requirePortalUser, genId, notify, getAdminUserIds } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const id = getRouterParam(event, 'id')
  const b = await readBody(event)
  const body = (b.body || '').toString().trim()
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Pesan kosong.' })

  const task = await queryOne<any>('SELECT * FROM portal_tasks WHERE id = ?', [id])
  if (!task) throw createError({ statusCode: 404, statusMessage: 'Tugas tidak ditemukan.' })

  const isTeam = user.role === 'staff' || user.role === 'freelancer'
  const isAdmin = user.role === 'admin' || user.role === 'super_admin'
  if (isTeam && task.assignee_id !== user.id) throw createError({ statusCode: 403, statusMessage: 'Bukan tugas kamu.' })
  if (!isTeam && !isAdmin) throw createError({ statusCode: 403, statusMessage: 'Akses ditolak.' })

  await execute('INSERT INTO portal_task_messages (id, task_id, user_id, body) VALUES (?, ?, ?, ?)',
    [genId('tmsg'), id, user.id, body])

  // Notif ke pihak lawan
  if (isTeam) await notify(await getAdminUserIds(), 'status_change', `Balasan tugas: ${task.title}`, body, `/client/admin/tasks`)
  else if (task.assignee_id) await notify(task.assignee_id, 'status_change', `Pesan tugas: ${task.title}`, body, `/client/tasks/${id}`)

  return { ok: true }
})
