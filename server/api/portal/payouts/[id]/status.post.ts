import { queryOne, execute } from '~/server/utils/db'
import { requireAdmin, notify, logActivity } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const b = await readBody(event)
  const status = b.status === 'paid' ? 'paid' : 'pending'

  const payout = await queryOne<any>('SELECT * FROM portal_payouts WHERE id = ?', [id])
  if (!payout) throw createError({ statusCode: 404, statusMessage: 'Payout tidak ditemukan.' })

  const paidAt = status === 'paid' ? 'NOW()' : 'NULL'
  await execute(`UPDATE portal_payouts SET status = ?, paid_at = ${paidAt} WHERE id = ?`, [status, id])
  if (status === 'paid')
    await notify(payout.user_id, 'status_change', `Pembayaran diterima 🎉`, `Rp ${Number(payout.amount).toLocaleString('id-ID')} sudah dibayar.`, '/client/my-payouts')
  await logActivity(event, admin, 'payout_status', 'payout', id, { status })
  return { ok: true }
})
