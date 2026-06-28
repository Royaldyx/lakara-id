import { queryOne, execute } from '~/server/utils/db'
import { requireAdmin, notify, getClientUserIds, logActivity } from '~/server/utils/portal'

const STATUSES = ['paid', 'unpaid', 'overdue']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const b = await readBody(event)
  if (!STATUSES.includes(b.status))
    throw createError({ statusCode: 400, statusMessage: 'Status tidak valid.' })

  const inv = await queryOne<any>('SELECT * FROM portal_invoices WHERE id = ?', [id])
  if (!inv) throw createError({ statusCode: 404, statusMessage: 'Invoice tidak ditemukan.' })

  const paidAt = b.status === 'paid' ? 'NOW()' : 'NULL'
  await execute(`UPDATE portal_invoices SET status = ?, paid_at = ${paidAt} WHERE id = ?`, [b.status, id])

  if (b.status === 'paid')
    await notify(await getClientUserIds(inv.client_id), 'invoice', `Pembayaran diterima`, `${inv.invoice_number} lunas. Terima kasih!`, `/client/invoices/${id}`)
  await logActivity(event, admin, 'invoice_status', 'invoice', id, { status: b.status })

  return { ok: true }
})
