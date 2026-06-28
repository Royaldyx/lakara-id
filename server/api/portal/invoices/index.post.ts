import { execute } from '~/server/utils/db'
import { requireAdmin, genId, notify, getClientUserIds, logActivity } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const b = await readBody(event)

  const clientId = (b.client_id || '').toString()
  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'client_id wajib.' })

  const items = Array.isArray(b.items) ? b.items : []
  const amount = items.length
    ? items.reduce((s: number, it: any) => s + (Number(it.qty || 1) * Number(it.price || 0)), 0)
    : Number(b.amount || 0)
  if (amount <= 0) throw createError({ statusCode: 400, statusMessage: 'Nominal invoice tidak valid.' })

  const now = new Date()
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '')
  const invoiceNumber = `INV-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const id = genId('inv')

  await execute(
    `INSERT INTO portal_invoices (id, invoice_number, client_id, amount, items, status, issued_date, due_date, notes, created_by)
     VALUES (?, ?, ?, ?, ?, 'unpaid', CURDATE(), ?, ?, ?)`,
    [id, invoiceNumber, clientId, amount, JSON.stringify(items), b.due_date || null, b.notes || null, admin.id]
  )

  await notify(await getClientUserIds(clientId), 'invoice', `Invoice baru: ${invoiceNumber}`,
    `Tagihan Rp ${amount.toLocaleString('id-ID')}`, `/client/invoices/${id}`)
  await logActivity(event, admin, 'create_invoice', 'invoice', id, { amount })

  return { ok: true, id, invoice_number: invoiceNumber }
})
