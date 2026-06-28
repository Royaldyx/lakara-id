import { execute } from '~/server/utils/db'
import { requireAdmin, genId, notify, logActivity } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const b = await readBody(event)
  const userId = (b.user_id || '').toString()
  const amount = Math.max(0, Number(b.amount) || 0)
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'Anggota wajib.' })
  if (amount <= 0) throw createError({ statusCode: 400, statusMessage: 'Nominal tidak valid.' })

  const items = Array.isArray(b.items) ? b.items : []
  const id = genId('pay')
  await execute(
    `INSERT INTO portal_payouts (id, user_id, period_start, period_end, amount, items, status, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [id, userId, b.period_start || null, b.period_end || null, amount, JSON.stringify(items), b.notes || null, admin.id]
  )
  await notify(userId, 'status_change', `Payout dibuat: Rp ${amount.toLocaleString('id-ID')}`, 'Menunggu pembayaran.', '/client/my-payouts')
  await logActivity(event, admin, 'create_payout', 'user', userId, { amount })
  return { ok: true, id }
})
