import { getMemberStore } from '~/server/utils/member'
import { queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const store      = await getMemberStore(event)
  const merchantRef = getRouterParam(event, 'ref')

  if (!merchantRef)
    throw createError({ statusCode: 400, statusMessage: 'Ref tidak valid.' })

  const payment = await queryOne<any>(
    'SELECT * FROM payments WHERE id = ? AND store_id = ?',
    [merchantRef, store.id],
  )

  if (!payment)
    throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan.' })

  return {
    ok:          true,
    merchant_ref: payment.id,
    tripay_ref:  payment.tripay_ref,
    tier_type:   payment.tier_type,
    months:      payment.months,
    amount:      payment.amount,
    method:      payment.method,
    method_type: payment.method_type,
    pay_code:    payment.pay_code,
    pay_url:     payment.pay_url,
    checkout_url: payment.checkout_url,
    qr_url:      payment.qr_url,
    qr_string:   payment.qr_string,
    status:      payment.status,
    expired_at:  payment.expired_at,
    paid_at:     payment.paid_at,
  }
})
