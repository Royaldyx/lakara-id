import { queryOne } from '~/server/utils/db'
import { requirePortalUser, assertClientOwnership } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const id = getRouterParam(event, 'id')

  const inv = await queryOne<any>(
    `SELECT i.*, c.company_name, c.email AS client_email, c.whatsapp AS client_whatsapp, c.pic_name
     FROM portal_invoices i JOIN portal_clients c ON c.id = i.client_id WHERE i.id = ?`, [id]
  )
  if (!inv) throw createError({ statusCode: 404, statusMessage: 'Invoice tidak ditemukan.' })
  assertClientOwnership(user, inv.client_id)

  try { inv.items = typeof inv.items === 'string' ? JSON.parse(inv.items || '[]') : (inv.items || []) }
  catch { inv.items = [] }

  return { ok: true, invoice: inv }
})
