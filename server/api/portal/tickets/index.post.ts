import { execute } from '~/server/utils/db'
import { requirePortalUser, genId, scopedClientId, notify, getAdminUserIds, logActivity } from '~/server/utils/portal'

const CATEGORIES = ['revision', 'billing', 'technical', 'general']

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const b = await readBody(event)

  const subject = (b.subject || '').toString().trim()
  const category = CATEGORIES.includes(b.category) ? b.category : 'general'
  const message = (b.message || '').toString().trim()
  if (!subject) throw createError({ statusCode: 400, statusMessage: 'Subjek wajib diisi.' })

  const clientId = scopedClientId(user, b.client_id)
  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'client_id wajib (untuk admin).' })

  const ticketId = genId('tkt')
  await execute(
    `INSERT INTO portal_tickets (id, client_id, subject, category, status, created_by)
     VALUES (?, ?, ?, ?, 'open', ?)`,
    [ticketId, clientId, subject, category, user.id]
  )
  if (message) {
    await execute(
      'INSERT INTO portal_ticket_messages (id, ticket_id, user_id, message) VALUES (?, ?, ?, ?)',
      [genId('msg'), ticketId, user.id, message]
    )
  }

  // Notifikasi: jika dibuat klien → ke semua admin
  if (user.role === 'client') {
    await notify(await getAdminUserIds(), 'ticket_new', `Tiket baru: ${subject}`, message || undefined, `/client/tickets/${ticketId}`)
  }
  await logActivity(event, user, 'create_ticket', 'ticket', ticketId)

  return { ok: true, id: ticketId }
})
