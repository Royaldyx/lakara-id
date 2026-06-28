import { queryOne, execute } from '~/server/utils/db'
import { requirePortalUser, assertClientOwnership, genId, notify, getAdminUserIds, getClientUserIds } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const id = getRouterParam(event, 'id')
  const b = await readBody(event)
  const message = (b.message || '').toString().trim()
  if (!message) throw createError({ statusCode: 400, statusMessage: 'Pesan kosong.' })

  const ticket = await queryOne<any>('SELECT * FROM portal_tickets WHERE id = ?', [id])
  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Tiket tidak ditemukan.' })
  assertClientOwnership(user, ticket.client_id)

  await execute(
    'INSERT INTO portal_ticket_messages (id, ticket_id, user_id, message, attachment) VALUES (?, ?, ?, ?, ?)',
    [genId('msg'), id, user.id, message, b.attachment || null]
  )

  // Update status: admin balas → waiting_client; client balas → in_progress
  const newStatus = user.role === 'client' ? 'in_progress' : 'waiting_client'
  await execute('UPDATE portal_tickets SET status = ?, updated_at = NOW() WHERE id = ?', [newStatus, id])

  // Notifikasi ke pihak lawan
  if (user.role === 'client') {
    await notify(await getAdminUserIds(), 'ticket_reply', `Balasan tiket: ${ticket.subject}`, message, `/client/tickets/${id}`)
  } else {
    await notify(await getClientUserIds(ticket.client_id), 'ticket_reply', `Tim Lakara membalas tiketmu`, message, `/client/tickets/${id}`)
  }

  return { ok: true }
})
