import { getMemberStore } from '~/server/utils/member'
import { queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const store = await getMemberStore(event)

  const payment = await queryOne<any>(
    `SELECT id, tier_type, months, amount, method, expired_at
     FROM payments
     WHERE store_id = ? AND status = 'pending' AND expired_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [store.id],
  )

  return { payment: payment || null }
})
