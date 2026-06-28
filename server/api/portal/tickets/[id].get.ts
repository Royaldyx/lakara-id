import { query, queryOne } from '~/server/utils/db'
import { requirePortalUser, assertClientOwnership } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const id = getRouterParam(event, 'id')

  const ticket = await queryOne<any>(
    `SELECT t.*, c.company_name FROM portal_tickets t
     JOIN portal_clients c ON c.id = t.client_id WHERE t.id = ?`, [id]
  )
  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Tiket tidak ditemukan.' })
  assertClientOwnership(user, ticket.client_id)

  const messages = await query<any>(
    `SELECT m.id, m.user_id, m.message, m.attachment, m.created_at,
            u.name AS sender_name, u.role AS sender_role
     FROM portal_ticket_messages m
     LEFT JOIN portal_users u ON u.id = m.user_id
     WHERE m.ticket_id = ? ORDER BY m.created_at ASC`, [id]
  )

  return { ok: true, ticket, messages }
})
