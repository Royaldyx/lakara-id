import { checkAuth } from '~/server/utils/data'
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  // 1. Semua payment yang sudah paid (termasuk method='ADMIN' dari set_tier)
  const payments = await query<any>(
    `SELECT
       p.id, p.store_id, p.tier_type, p.months, p.amount,
       p.method, p.status,
       p.checkout_url, p.pay_code, p.qr_url,
       COALESCE(p.paid_at, p.created_at) AS paid_at,
       p.created_at,
       s.name  AS store_name,
       s.slug  AS store_slug,
       'payment' AS source
     FROM payments p
     LEFT JOIN stores s ON p.store_id = s.id
     WHERE p.status = 'paid'`,
  )

  // 2. Legacy manual upgrade_requests (flow lama sebelum Tripay)
  const legacyRequests = await query<any>(
    `SELECT
       CONCAT('REQ-', ur.id)                              AS id,
       ur.store_id,
       ur.tier_type,
       COALESCE(ur.approved_months, 1)                    AS months,
       0                                                   AS amount,
       'MANUAL'                                            AS method,
       'approved'                                          AS status,
       NULL AS checkout_url, NULL AS pay_code, NULL AS qr_url,
       COALESCE(ur.updated_at, ur.created_at)             AS paid_at,
       ur.created_at,
       COALESCE(s.name, ur.store_name)                    AS store_name,
       COALESCE(s.slug, ur.store_slug)                    AS store_slug,
       'request'                                           AS source
     FROM upgrade_requests ur
     LEFT JOIN stores s ON ur.store_id = s.id
     WHERE ur.status = 'approved'`,
  )

  // Gabung + sort by paid_at DESC
  const all = [...payments, ...legacyRequests].sort((a, b) => {
    const ta = a.paid_at ? new Date(a.paid_at).getTime() : 0
    const tb = b.paid_at ? new Date(b.paid_at).getTime() : 0
    return tb - ta
  })

  // Stats
  const now        = new Date()
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const paid       = all.filter(r => r.method !== 'ADMIN' && r.method !== 'MANUAL')
  const totalRevenue = paid.reduce((s, r) => s + (Number(r.amount) || 0), 0)
  const thisMonth    = all.filter(r => r.paid_at && new Date(r.paid_at) >= startMonth).length
  const proCount     = all.filter(r => r.tier_type === 'pro').length
  const premiumCount = all.filter(r => r.tier_type === 'premium').length

  return {
    ok: true,
    data: all.slice(0, 300),
    stats: { total: all.length, thisMonth, proCount, premiumCount, totalRevenue },
  }
})
