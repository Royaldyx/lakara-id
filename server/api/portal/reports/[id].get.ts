import { queryOne } from '~/server/utils/db'
import { requirePortalUser, assertClientOwnership } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const id = getRouterParam(event, 'id')

  const rpt = await queryOne<any>(
    `SELECT r.*, c.company_name FROM portal_reports r JOIN portal_clients c ON c.id = r.client_id WHERE r.id = ?`, [id]
  )
  if (!rpt) throw createError({ statusCode: 404, statusMessage: 'Laporan tidak ditemukan.' })
  assertClientOwnership(user, rpt.client_id)

  try { rpt.kpi = typeof rpt.kpi === 'string' ? JSON.parse(rpt.kpi || '[]') : (rpt.kpi || []) }
  catch { rpt.kpi = [] }

  return { ok: true, report: rpt }
})
