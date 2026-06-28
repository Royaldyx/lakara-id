import { query } from '~/server/utils/db'
import { requirePortalUser } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const status = (getQuery(event).status || '').toString()

  if (user.role === 'client') {
    const rows = await query<any>(
      `SELECT t.id, t.subject, t.category, t.status, t.created_at, t.updated_at,
              (SELECT COUNT(*) FROM portal_ticket_messages m WHERE m.ticket_id = t.id) AS msg_count
       FROM portal_tickets t
       WHERE t.client_id = ? ${status ? 'AND t.status = ?' : ''}
       ORDER BY t.updated_at DESC`,
      status ? [user.client_id, status] : [user.client_id]
    )
    return { ok: true, data: rows }
  }

  // admin — semua tiket + nama klien
  const rows = await query<any>(
    `SELECT t.id, t.subject, t.category, t.status, t.created_at, t.updated_at, t.client_id,
            c.company_name,
            (SELECT COUNT(*) FROM portal_ticket_messages m WHERE m.ticket_id = t.id) AS msg_count
     FROM portal_tickets t
     JOIN portal_clients c ON c.id = t.client_id
     ${status ? 'WHERE t.status = ?' : ''}
     ORDER BY t.updated_at DESC`,
    status ? [status] : []
  )
  return { ok: true, data: rows }
})
