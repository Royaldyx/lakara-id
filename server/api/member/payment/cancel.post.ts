import { getMemberStore } from '~/server/utils/member'
import { queryOne, execute } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const store = await getMemberStore(event)
  const { merchant_ref } = await readBody(event)

  if (!merchant_ref)
    throw createError({ statusCode: 400, statusMessage: 'merchant_ref diperlukan.' })

  const payment = await queryOne<any>(
    'SELECT id, store_id, status FROM payments WHERE id = ? AND store_id = ?',
    [merchant_ref, store.id],
  )

  if (!payment)
    throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan.' })

  if (payment.status !== 'pending')
    throw createError({ statusCode: 400, statusMessage: 'Transaksi tidak bisa dibatalkan (sudah diproses).' })

  await execute(
    "UPDATE payments SET status = 'cancelled', updated_at = NOW() WHERE id = ?",
    [merchant_ref],
  )

  return { ok: true }
})
