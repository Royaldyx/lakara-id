import { queryOne, execute } from '~/server/utils/db'
import { requirePortalUser, genId } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  if (user.role !== 'staff' && user.role !== 'freelancer')
    throw createError({ statusCode: 403, statusMessage: 'Hanya anggota tim yang bisa isi laporan.' })

  const b = await readBody(event)
  const summary = (b.summary || '').toString().trim()
  const date = (b.report_date || '').toString() || new Date().toISOString().slice(0, 10)
  if (!summary) throw createError({ statusCode: 400, statusMessage: 'Isi laporan wajib.' })

  const hours = Math.max(0, Number(b.hours) || 0)
  const links = (b.links || '').toString().slice(0, 1000)

  // Upsert per (user, tanggal)
  const existing = await queryOne<any>(
    'SELECT id FROM portal_daily_reports WHERE user_id = ? AND report_date = ?', [user.id, date]
  )
  if (existing) {
    await execute('UPDATE portal_daily_reports SET summary = ?, hours = ?, links = ? WHERE id = ?',
      [summary, hours, links, existing.id])
    return { ok: true, id: existing.id }
  }

  const id = genId('dr')
  await execute(
    'INSERT INTO portal_daily_reports (id, user_id, report_date, summary, hours, links) VALUES (?, ?, ?, ?, ?, ?)',
    [id, user.id, date, summary, hours, links]
  )
  return { ok: true, id }
})
