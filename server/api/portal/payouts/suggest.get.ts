import { query } from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/portal'

// Hitung total fee tugas SELESAI seorang anggota dalam periode (untuk bantu buat payout).
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const userId = (q.user_id || '').toString()
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'user_id wajib.' })
  const from = (q.from || '').toString()
  const to   = (q.to || '').toString()

  const where: string[] = ["assignee_id = ?", "status = 'done'", 'fee > 0']
  const params: any[] = [userId]
  if (from) { where.push('DATE(updated_at) >= ?'); params.push(from) }
  if (to)   { where.push('DATE(updated_at) <= ?'); params.push(to) }

  const tasks = await query<any>(
    `SELECT id, title, fee, updated_at FROM portal_tasks WHERE ${where.join(' AND ')} ORDER BY updated_at DESC`,
    params
  )
  const total = tasks.reduce((s: number, t: any) => s + Number(t.fee || 0), 0)
  return { ok: true, total, tasks }
})
