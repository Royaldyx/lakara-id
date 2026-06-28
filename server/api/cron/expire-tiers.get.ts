import { execute, query } from '~/server/utils/db'
import { useRuntimeConfig } from '#imports'

// Cron: turunkan tier member yang sudah lewat masa aktif → free.
// Dipanggil cron cPanel:  curl -s "https://lakara.id/api/cron/expire-tiers?key=SECRET"
// Set NUXT_CRON_SECRET di env (fallback ke adminPass kalau belum diisi).
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  const secret = (cfg.cronSecret as string) || (cfg.adminPass as string) || ''
  const key = (getQuery(event).key || '').toString()
  if (!secret || key !== secret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Ambil yang akan diturunkan (untuk logging)
  const expiring = await query<any>(
    `SELECT id, slug, product_tier, tier_expires_at FROM stores
     WHERE product_tier <> 'free' AND tier_expires_at IS NOT NULL AND tier_expires_at < NOW()`
  )

  const res = await execute(
    `UPDATE stores SET product_tier = 'free', tier_expires_at = NULL
     WHERE product_tier <> 'free' AND tier_expires_at IS NOT NULL AND tier_expires_at < NOW()`
  )

  return {
    ok: true,
    downgraded: (res as any)?.affectedRows ?? expiring.length,
    stores: expiring.map(s => ({ slug: s.slug, was: s.product_tier, expired_at: s.tier_expires_at })),
  }
})
