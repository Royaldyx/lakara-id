import { query, execute } from '~/server/utils/db'
import { requireAdmin, genId } from '~/server/utils/portal'

const VALID = ['hadir', 'izin', 'sakit', 'alpha', 'libur']

// POST /api/portal/attendance  (admin only)
//  body: { user_id, date(YYYY-MM-DD), status, note? }
//  status kosong / 'clear' → hapus catatan absen hari itu
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)

  const userId = (body.user_id || '').toString()
  const date = (body.date || '').toString().slice(0, 10)
  const status = (body.status || '').toString()
  const note = (body.note || '').toString().slice(0, 255) || null

  if (!userId || !date) throw createError({ statusCode: 400, statusMessage: 'user_id & date wajib.' })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw createError({ statusCode: 400, statusMessage: 'Format tanggal salah.' })

  // Pastikan target adalah anggota tim
  const member = await query<any>(
    "SELECT id FROM portal_users WHERE id = ? AND role IN ('staff','freelancer') LIMIT 1", [userId]
  )
  if (!member.length) throw createError({ statusCode: 404, statusMessage: 'Anggota tim tidak ditemukan.' })

  // Hapus
  if (!status || status === 'clear') {
    await execute('DELETE FROM portal_attendance WHERE user_id = ? AND `date` = ?', [userId, date])
    return { ok: true, cleared: true }
  }

  if (!VALID.includes(status)) throw createError({ statusCode: 400, statusMessage: 'Status tidak valid.' })

  // Upsert
  await execute(
    `INSERT INTO portal_attendance (id, user_id, \`date\`, status, note, created_by)
     VALUES (?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE status = VALUES(status), note = VALUES(note), created_by = VALUES(created_by)`,
    [genId('att'), userId, date, status, note, admin.id]
  )
  return { ok: true }
})
