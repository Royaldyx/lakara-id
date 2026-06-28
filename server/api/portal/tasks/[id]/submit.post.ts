import { getDataDir } from '~/server/utils/data'
import { queryOne, execute } from '~/server/utils/db'
import { requirePortalUser, genId, notify, getAdminUserIds, logActivity } from '~/server/utils/portal'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, extname } from 'path'

const ALLOWED = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf', '.mp4', '.webm', '.zip', '.doc', '.docx', '.psd', '.ai', '.fig']
const MAX_KB = 20480

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  if (user.role !== 'staff' && user.role !== 'freelancer')
    throw createError({ statusCode: 403, statusMessage: 'Hanya assignee yang bisa submit.' })

  const id = getRouterParam(event, 'id')
  const task = await queryOne<any>('SELECT * FROM portal_tasks WHERE id = ?', [id])
  if (!task) throw createError({ statusCode: 404, statusMessage: 'Tugas tidak ditemukan.' })
  if (task.assignee_id !== user.id) throw createError({ statusCode: 403, statusMessage: 'Bukan tugas kamu.' })

  const parts = await readMultipartFormData(event)
  const field = (n: string) => parts?.find(p => p.name === n && !p.filename)?.data?.toString().trim() || ''
  const link = field('link')
  const note = field('note')

  let deliverable = link || task.deliverable
  const filePart = parts?.find(p => p.name === 'file' && p.filename && p.data?.length)
  if (filePart) {
    const ext = extname(filePart.filename!).toLowerCase()
    if (!ALLOWED.includes(ext)) throw createError({ statusCode: 400, statusMessage: `Format ${ext} tidak didukung.` })
    if (filePart.data!.length > MAX_KB * 1024) throw createError({ statusCode: 400, statusMessage: `File melebihi ${MAX_KB / 1024} MB.` })
    const uploadDir = join(getDataDir(), 'uploads')
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`
    writeFileSync(join(uploadDir, filename), filePart.data!)
    deliverable = `/api/file/${filename}`
  }

  if (!deliverable) throw createError({ statusCode: 400, statusMessage: 'Lampirkan file atau link hasil.' })

  await execute(
    "UPDATE portal_tasks SET deliverable = ?, status = 'submitted', submitted_at = NOW() WHERE id = ?",
    [deliverable, id]
  )
  if (note) {
    await execute('INSERT INTO portal_task_messages (id, task_id, user_id, body) VALUES (?, ?, ?, ?)',
      [genId('tmsg'), id, user.id, note])
  }

  await notify(await getAdminUserIds(), 'status_change', `Tugas disubmit: ${task.title}`, `oleh ${user.name}`, `/client/admin/tasks`)
  await logActivity(event, user, 'submit_task', 'task', id)
  return { ok: true }
})
