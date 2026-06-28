import { query, queryOne } from '~/server/utils/db'
import { parseStore } from '~/server/utils/member'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)

  if (q.slug) {
    const raw = await queryOne<any>('SELECT * FROM stores WHERE slug = ? AND active = 1', [q.slug])
    if (!raw) return { success: false, data: null }
    const store = parseStore(raw)
    store.products = (store.products || []).filter((p: any) => p.published !== false)
    const { member_password, member_email, ...safe } = store
    return { success: true, data: safe }
  }

  if (q.slug_product && q.slug_store) {
    const raw = await queryOne<any>('SELECT * FROM stores WHERE slug = ? AND active = 1', [q.slug_store])
    if (!raw) return { success: false, data: null }
    const store = parseStore(raw)
    const product = (store.products || []).find((p: any) => p.slug === q.slug_product && p.published !== false)
    if (!product) return { success: false, data: null }
    const { member_password, member_email, ...safeStore } = store
    return { success: true, data: { store: safeStore, product } }
  }

  // List all active stores (no member_password / member_email)
  const rows = await query<any>('SELECT * FROM stores WHERE active = 1')
  const stores = rows.map((r: any) => {
    const s = parseStore(r)
    const { member_password, member_email, ...safe } = s
    return { ...safe, products: undefined }
  })
  return { success: true, data: stores }
})
