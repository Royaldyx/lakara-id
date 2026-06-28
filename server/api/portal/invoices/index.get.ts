import { query } from '~/server/utils/db'
import { requirePortalUser, scopedClientId } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const q = getQuery(event)
  const status = (q.status || '').toString()

  if (user.role === 'client') {
    const rows = await query<any>(
      `SELECT id, invoice_number, amount, status, issued_date, due_date, paid_at, created_at
       FROM portal_invoices WHERE client_id = ? ${status ? 'AND status = ?' : ''}
       ORDER BY created_at DESC`,
      status ? [user.client_id, status] : [user.client_id]
    )
    return { ok: true, data: rows }
  }

  // admin — semua + nama klien
  const cid = (q.client_id || '').toString()
  const where: string[] = []
  const params: any[] = []
  if (status) { where.push('i.status = ?'); params.push(status) }
  if (cid)    { where.push('i.client_id = ?'); params.push(cid) }
  const rows = await query<any>(
    `SELECT i.id, i.invoice_number, i.amount, i.status, i.issued_date, i.due_date, i.paid_at, i.created_at,
            i.client_id, c.company_name
     FROM portal_invoices i JOIN portal_clients c ON c.id = i.client_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY i.created_at DESC`, params
  )
  return { ok: true, data: rows }
})
