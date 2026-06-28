import { getMemberStore } from '~/server/utils/member'
import { queryOne, execute } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const store = await getMemberStore(event)

  if (store.product_tier === 'premium')
    throw createError({ statusCode: 400, statusMessage: 'Toko kamu sudah di tier Premium.' })

  const hasPending = await queryOne(
    "SELECT id FROM upgrade_requests WHERE store_id = ? AND status = 'pending'",
    [store.id]
  )
  if (hasPending)
    throw createError({ statusCode: 400, statusMessage: 'Kamu sudah punya request upgrade yang sedang diproses.' })

  const body = await readBody(event)
  const { note } = body
  const tier_type = body.tier_type === 'premium' ? 'premium' : 'pro'

  // If already pro and wants pro, block
  if (store.product_tier === 'pro' && tier_type === 'pro')
    throw createError({ statusCode: 400, statusMessage: 'Toko kamu sudah di tier Pro.' })

  await execute(
    'INSERT INTO upgrade_requests (id, store_id, store_name, store_slug, tier_type, note, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [String(Date.now()), store.id, store.name, store.slug, tier_type, note || '', 'pending']
  )

  return { ok: true }
})
