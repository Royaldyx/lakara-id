import { queryOne, execute } from '~/server/utils/db'
import { requireAdmin, notify, getClientUserIds, logActivity } from '~/server/utils/portal'

const STATUSES = ['open', 'in_progress', 'waiting_client', 'closed']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const b = await readBody(event)
  if (!STATUSES.includes(b.status))
    throw createError({ statusCode: 400, statusMessage: 'Status tidak valid.' })

  const ticket = await queryOne<any>('SELECT * FROM portal_tickets WHERE id = ?', [id])
  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Tiket tidak ditemukan.' })

  await execute('UPDATE portal_tickets SET status = ?, updated_at = NOW() WHERE id = ?', [b.status, id])
  await notify(await getClientUserIds(ticket.client_id), 'status_change', `Status tiket: ${b.status}`, ticket.subject, `/client/tickets/${id}`)
  await logActivity(event, admin, 'ticket_status', 'ticket', id, { status: b.status })

  return { ok: true }
})
