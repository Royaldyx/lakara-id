import { query } from '~/server/utils/db'
import { requirePortalUser, scopedClientId } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)

  if (user.role === 'client') {
    const rows = await query<any>(
      `SELECT id, title, period_start, period_end, created_at FROM portal_reports
       WHERE client_id = ? ORDER BY created_at DESC`, [user.client_id]
    )
    return { ok: true, data: rows }
  }

  const cid = (getQuery(event).client_id || '').toString()
  const rows = await query<any>(
    `SELECT r.id, r.title, r.period_start, r.period_end, r.created_at, r.client_id, c.company_name
     FROM portal_reports r JOIN portal_clients c ON c.id = r.client_id
     ${cid ? 'WHERE r.client_id = ?' : ''} ORDER BY r.created_at DESC`,
    cid ? [cid] : []
  )
  return { ok: true, data: rows }
})
