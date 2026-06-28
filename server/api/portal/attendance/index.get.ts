import { query } from '~/server/utils/db'
import { requirePortalUser } from '~/server/utils/portal'

// GET /api/portal/attendance
//  - team (staff/freelancer): absensi sendiri
//  - admin/super_admin: wajib ?user_id → absensi anggota tsb
//  - opsional ?from=YYYY-MM-DD&to=YYYY-MM-DD untuk batasi rentang (mis. 1 bulan)
export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const q = getQuery(event)

  let targetId = user.id
  if (user.role === 'admin' || user.role === 'super_admin') {
    if (!q.user_id) throw createError({ statusCode: 400, statusMessage: 'user_id wajib.' })
    targetId = q.user_id.toString()
  } else if (user.role !== 'staff' && user.role !== 'freelancer') {
    throw createError({ statusCode: 403, statusMessage: 'Akses ditolak.' })
  }

  const where: string[] = ['user_id = ?']
  const params: any[] = [targetId]
  if (q.from) { where.push('`date` >= ?'); params.push(q.from.toString()) }
  if (q.to)   { where.push('`date` <= ?'); params.push(q.to.toString()) }

  const rows = await query<any>(
    `SELECT id, user_id, DATE_FORMAT(\`date\`, '%Y-%m-%d') AS date, status, note
     FROM portal_attendance WHERE ${where.join(' AND ')} ORDER BY \`date\` DESC LIMIT 400`,
    params
  )
  return { ok: true, data: rows }
})
