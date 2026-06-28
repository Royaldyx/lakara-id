import { createHash } from 'crypto'
import { queryOne } from '~/server/utils/db'

export const hashPassword = (p: string) =>
  createHash('sha256').update(p + 'lakara_salt').digest('hex')

/** Normalize raw MySQL row: parse JSON strings, normalize TINYINT booleans */
export function parseStore(store: any): any {
  if (!store) return null
  return {
    ...store,
    active:         store.active === 1        || store.active === true,
    member_active:  store.member_active === 1  || store.member_active === true,
    why_buy:   typeof store.why_buy   === 'string' ? JSON.parse(store.why_buy   || '[]') : (store.why_buy   ?? []),
    products:  typeof store.products  === 'string' ? JSON.parse(store.products  || '[]') : (store.products  ?? []),
    links_bio: store.links_bio
      ? (typeof store.links_bio === 'string' ? JSON.parse(store.links_bio) : store.links_bio)
      : null,
  }
}

/** Get the authenticated member's store from cookie. Throws 401 if not logged in. */
export async function getMemberStore(event: any) {
  const storeId = getCookie(event, 'lakara_member')
  if (!storeId) throw createError({ statusCode: 401, statusMessage: 'Silakan login terlebih dahulu.' })

  const raw = await queryOne<any>('SELECT * FROM stores WHERE id = ?', [storeId])
  if (!raw)  throw createError({ statusCode: 401, statusMessage: 'Sesi tidak valid. Silakan login ulang.' })

  return parseStore(raw)
}

/** Strip sensitive fields before sending store to client */
export function safeMemberStore(store: any) {
  const parsed = parseStore(store)
  if (!parsed) return null
  const { member_password, ...safe } = parsed
  return safe
}
