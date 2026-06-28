import { checkAuth } from '~/server/utils/data'
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const stores = await query<any>(
    "SELECT id, slug, name, member_email, member_active, active, member_password, products, product_tier, tier_started_at, tier_expires_at, created_at FROM stores"
  )

  const members = stores.map((s: any) => ({
    store_id:        s.id,
    store_name:      s.name,
    store_slug:      s.slug,
    member_email:    s.member_email,
    member_active:   s.member_active === 1 || s.member_active === true,
    store_active:    s.active === 1 || s.active === true,
    has_password:    !!s.member_password,
    product_count:   (() => { try { return JSON.parse(s.products || '[]').length } catch { return 0 } })(),
    product_tier:    s.product_tier || 'free',
    tier_started_at: s.tier_started_at,
    tier_expires_at: s.tier_expires_at,
    created_at:      s.created_at,
  }))

  return { ok: true, data: members }
})
