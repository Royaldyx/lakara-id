import { getMemberStore } from '~/server/utils/member'
import { queryOne, query } from '~/server/utils/db'

async function getSettings(): Promise<Record<string, any>> {
  const rows = await query<{ key: string; value: string }>('SELECT `key`, `value` FROM settings')
  const result: Record<string, any> = {}
  for (const row of rows) {
    try { result[row.key] = JSON.parse(row.value) } catch { result[row.key] = row.value }
  }
  return result
}

export default defineEventHandler(async (event) => {
  const store    = await getMemberStore(event)
  const settings = await getSettings()

  const pending = await queryOne(
    "SELECT id FROM upgrade_requests WHERE store_id = ? AND status = 'pending'",
    [store.id]
  )

  return {
    ok:              true,
    tier:            store.product_tier  || 'free',
    tier_expires_at: store.tier_expires_at || null,
    has_pending:     !!pending,
    pro_price:       settings.pro_price      ?? 9000,
    premium_price:   settings.premium_price  ?? 35000,
    upgrade_price:   settings.upgrade_price  ?? 9000,   // legacy fallback
    upgrade_promo:   settings.upgrade_promo  ?? null,
    bank_name:       settings.bank_name      || '',
    bank_account:    settings.bank_account   || '',
    bank_holder:     settings.bank_holder    || '',
  }
})
