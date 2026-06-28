import { queryOne, execute } from '~/server/utils/db'
import { requireAdmin, genId, notify, logActivity } from '~/server/utils/portal'

const TYPES = ['design', 'writing', 'uiux', 'other']
const STATUS = ['todo', 'in_progress', 'submitted', 'revision', 'done']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const b = await readBody(event)
  const action = b.action || 'create'

  // ---------- CREATE ----------
  if (action === 'create') {
    const title = (b.title || '').toString().trim()
    if (!title) throw createError({ statusCode: 400, statusMessage: 'Judul tugas wajib.' })
    const type = TYPES.includes(b.type) ? b.type : 'other'

    // Validasi assignee = user role staff/freelancer
    let assignee: string | null = null
    if (b.assignee_id) {
      const u = await queryOne<any>("SELECT id, role FROM portal_users WHERE id = ? AND role IN ('staff','freelancer') AND active = 1", [b.assignee_id])
      if (!u) throw createError({ statusCode: 400, statusMessage: 'Assignee tidak valid.' })
      assignee = u.id
    }

    const id = genId('tsk')
    await execute(
      `INSERT INTO portal_tasks (id, title, description, type, assignee_id, status, deadline, fee, client_id, content_id, created_by)
       VALUES (?, ?, ?, ?, ?, 'todo', ?, ?, ?, ?, ?)`,
      [id, title, b.description || null, type, assignee, b.deadline || null,
       Math.max(0, Number(b.fee) || 0), b.client_id || null, b.content_id || null, admin.id]
    )
    if (assignee) await notify(assignee, 'status_change', `Tugas baru: ${title}`, b.description || undefined, `/client/tasks/${id}`)
    await logActivity(event, admin, 'create_task', 'task', id)
    return { ok: true, id }
  }

  if (!b.id) throw createError({ statusCode: 400, statusMessage: 'id tugas wajib.' })
  const task = await queryOne<any>('SELECT * FROM portal_tasks WHERE id = ?', [b.id])
  if (!task) throw createError({ statusCode: 404, statusMessage: 'Tugas tidak ditemukan.' })

  // ---------- UPDATE / ASSIGN ----------
  if (action === 'update') {
    const title = (b.title || '').toString().trim()
    if (!title) throw createError({ statusCode: 400, statusMessage: 'Judul tugas wajib.' })
    const type = TYPES.includes(b.type) ? b.type : task.type
    let assignee = task.assignee_id
    if (b.assignee_id !== undefined) {
      if (!b.assignee_id) assignee = null
      else {
        const u = await queryOne<any>("SELECT id FROM portal_users WHERE id = ? AND role IN ('staff','freelancer')", [b.assignee_id])
        if (!u) throw createError({ statusCode: 400, statusMessage: 'Assignee tidak valid.' })
        assignee = b.assignee_id
      }
    }
    const reassigned = assignee && assignee !== task.assignee_id
    await execute(
      `UPDATE portal_tasks SET title = ?, description = ?, type = ?, assignee_id = ?, deadline = ?, fee = ?, client_id = ?
       WHERE id = ?`,
      [title, b.description || null, type, assignee, b.deadline || null,
       Math.max(0, Number(b.fee) || 0), b.client_id || null, b.id]
    )
    if (reassigned) await notify(assignee, 'status_change', `Tugas diberikan ke kamu: ${title}`, undefined, `/client/tasks/${b.id}`)
    await logActivity(event, admin, 'update_task', 'task', b.id)
    return { ok: true }
  }

  // ---------- SET STATUS (approve/revisi/dll) ----------
  if (action === 'set_status') {
    if (!STATUS.includes(b.status)) throw createError({ statusCode: 400, statusMessage: 'Status tidak valid.' })
    await execute('UPDATE portal_tasks SET status = ? WHERE id = ?', [b.status, b.id])
    if (task.assignee_id) {
      const label = b.status === 'done' ? 'Tugas kamu disetujui ✅' : b.status === 'revision' ? 'Tugas perlu revisi' : `Status tugas: ${b.status}`
      await notify(task.assignee_id, 'status_change', label, task.title, `/client/tasks/${b.id}`)
    }
    await logActivity(event, admin, 'task_status', 'task', b.id, { status: b.status })
    return { ok: true }
  }

  // ---------- DELETE ----------
  if (action === 'delete') {
    await execute('DELETE FROM portal_tasks WHERE id = ?', [b.id])
    await logActivity(event, admin, 'delete_task', 'task', b.id)
    return { ok: true }
  }

  throw createError({ statusCode: 400, statusMessage: 'Action tidak dikenal.' })
})
