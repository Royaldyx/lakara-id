import { query } from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  // Daftar anggota tim + jumlah tugas aktif
  const rows = await query<any>(
    `SELECT u.id, u.role, u.name, u.email, u.phone, u.active, u.created_at,
            (SELECT COUNT(*) FROM portal_tasks t WHERE t.assignee_id = u.id AND t.status != 'done') AS active_tasks
     FROM portal_users u
     WHERE u.role IN ('staff','freelancer')
     ORDER BY u.created_at DESC`
  )
  return { ok: true, data: rows }
})
