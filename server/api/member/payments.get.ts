import { getMemberStore } from '~/server/utils/member'
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const store = await getMemberStore(event)

  const payments = await query<any>(
    `SELECT id, tier_type, months, amount, method, status, created_at, paid_at
     FROM payments
     WHERE store_id = ?
     ORDER BY created_at DESC
     LIMIT 20`,
    [store.id],
  )

  return { payments }
})
