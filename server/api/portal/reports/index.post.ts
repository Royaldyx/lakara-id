import { execute } from '~/server/utils/db'
import { requireAdmin, genId, notify, getClientUserIds, logActivity } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const b = await readBody(event)

  const clientId = (b.client_id || '').toString()
  const title = (b.title || '').toString().trim()
  if (!clientId || !title) throw createError({ statusCode: 400, statusMessage: 'Klien & judul wajib.' })

  const kpi = Array.isArray(b.kpi) ? b.kpi : []
  const id = genId('rpt')
  await execute(
    `INSERT INTO portal_reports (id, client_id, title, period_start, period_end, summary, kpi, insight, recommendation, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, clientId, title, b.period_start || null, b.period_end || null,
     b.summary || null, JSON.stringify(kpi), b.insight || null, b.recommendation || null, admin.id]
  )

  await notify(await getClientUserIds(clientId), 'status_change', `Laporan baru: ${title}`, 'Laporan performa terbaru sudah tersedia.', `/client/reports/${id}`)
  await logActivity(event, admin, 'create_report', 'client', clientId)
  return { ok: true, id }
})
