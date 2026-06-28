import { query, queryOne, execute } from '~/server/utils/db'
import { requireAdmin, genId, notify, getClientUserIds, logActivity } from '~/server/utils/portal'

// Generate invoice bulanan untuk semua klien dengan langganan aktif (retainer).
// Idempotent: skip kalau invoice langganan bulan ini sudah ada untuk klien tsb.
// Bisa dipanggil manual (tombol admin) atau via cron cPanel tiap awal bulan.
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const now = new Date()
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const dueDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

  const subs = await query<any>(
    `SELECT s.client_id, p.name AS package_name, p.price
     FROM portal_subscriptions s JOIN portal_packages p ON p.id = s.package_id
     WHERE s.status = 'active'`
  )

  let created = 0, skipped = 0
  for (const s of subs) {
    const price = Number(s.price || 0)
    if (price <= 0) { skipped++; continue }

    // Sudah ada invoice langganan bulan ini?
    const exist = await queryOne<any>(
      `SELECT id FROM portal_invoices
       WHERE client_id = ? AND YEAR(issued_date) = YEAR(CURDATE()) AND MONTH(issued_date) = MONTH(CURDATE())
         AND notes LIKE 'Langganan bulanan%'`, [s.client_id]
    )
    if (exist) { skipped++; continue }

    try {
      const id = genId('inv')
      const invoiceNumber = `INV-${ym.replace('-', '')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      const items = [{ desc: `Langganan ${s.package_name} (${ym})`, qty: 1, price }]
      await execute(
        `INSERT INTO portal_invoices (id, invoice_number, client_id, amount, items, status, issued_date, due_date, notes, created_by)
         VALUES (?, ?, ?, ?, ?, 'unpaid', CURDATE(), ?, ?, ?)`,
        [id, invoiceNumber, s.client_id, price, JSON.stringify(items), dueDate, `Langganan bulanan ${ym}`, admin.id]
      )
      await notify(await getClientUserIds(s.client_id), 'invoice', `Invoice bulanan: ${invoiceNumber}`,
        `Tagihan langganan Rp ${price.toLocaleString('id-ID')}`, `/client/invoices/${id}`)
      created++
    } catch { skipped++ }
  }

  await logActivity(event, admin, 'generate_recurring_invoice', null, null, { ym, created, skipped })
  return { ok: true, created, skipped, period: ym }
})
