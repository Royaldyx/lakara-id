import { getMemberStore } from '~/server/utils/member'

/**
 * Best-effort import produk dari link Shopee.
 * GRATIS — server hit API internal Shopee (v4/item/get). Kadang gagal (anti-bot),
 * itu wajar; frontend fallback ke input manual. Tidak ada dependency berbayar.
 */

// Ekstrak shopid & itemid dari berbagai format URL Shopee
function parseShopeeUrl(url: string): { shopid: string; itemid: string } | null {
  try {
    // Format 1: .../nama-produk-i.SHOPID.ITEMID
    let m = url.match(/-i\.(\d+)\.(\d+)/)
    if (m) return { shopid: m[1], itemid: m[2] }
    // Format 2: .../product/SHOPID/ITEMID
    m = url.match(/product\/(\d+)\/(\d+)/)
    if (m) return { shopid: m[1], itemid: m[2] }
    // Format 3: query ?shopId=..&itemId=..
    const u = new URL(url)
    const shopid = u.searchParams.get('shopId') || u.searchParams.get('shopid')
    const itemid = u.searchParams.get('itemId') || u.searchParams.get('itemid')
    if (shopid && itemid) return { shopid, itemid }
  } catch { /* ignore */ }
  return null
}

// Deteksi domain shopee (default .co.id)
function shopeeHost(url: string): string {
  try {
    const h = new URL(url).hostname
    if (h.includes('shopee.')) return h.replace(/^(www\.|m\.)/, '')
  } catch { /* ignore */ }
  return 'shopee.co.id'
}

const IMG_CDN = 'https://down-id.img.susercontent.com/file/'

export default defineEventHandler(async (event) => {
  await getMemberStore(event) // wajib login member (anti-abuse)

  const body = await readBody(event)
  const rawUrl = (body.url || '').toString().trim()
  if (!rawUrl) throw createError({ statusCode: 400, statusMessage: 'Link produk wajib diisi.' })

  // Resolve short-link (s.shopee.co.id / redirect) → URL final
  let url = rawUrl
  let ids = parseShopeeUrl(url)
  if (!ids) {
    try {
      const r = await $fetch.raw(rawUrl, { method: 'GET', redirect: 'follow', timeout: 8000 } as any)
      const finalUrl = (r as any).url || rawUrl
      url = finalUrl
      ids = parseShopeeUrl(finalUrl)
    } catch { /* ignore */ }
  }

  if (!ids)
    return { ok: false, message: 'Link tidak dikenali sebagai produk Shopee. Coba salin link produk (bukan link toko), atau isi manual.' }

  const host = shopeeHost(url)
  const apiUrl = `https://${host}/api/v4/item/get?itemid=${ids.itemid}&shopid=${ids.shopid}`

  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 9000)
    const res: any = await $fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Referer': url,
        'x-api-source': 'pc',
        'x-shopee-language': 'id',
        'Accept': 'application/json',
      },
    }).finally(() => clearTimeout(t))

    const item = res?.data
    if (!item || res?.error) {
      return { ok: false, message: 'Shopee menolak permintaan (anti-bot) atau produk tidak ditemukan. Silakan isi manual.' }
    }

    // Harga Shopee dalam satuan micro (×100000)
    const toRp = (v: any) => (v && Number(v) > 0 ? Math.round(Number(v) / 100000) : 0)
    const price = toRp(item.price ?? item.price_min)
    const priceBefore = toRp(item.price_before_discount ?? item.price_max)

    const images: string[] = Array.isArray(item.images)
      ? item.images.slice(0, 8).map((h: string) => IMG_CDN + h)
      : []

    return {
      ok: true,
      data: {
        name: (item.name || '').toString().slice(0, 200),
        description: (item.description || '').toString().slice(0, 5000),
        price,
        price_original: priceBefore > price ? priceBefore : 0,
        images,
        shopee_url: url,
        rating: item.item_rating?.rating_star ? Math.round(item.item_rating.rating_star * 10) / 10 : 0,
      },
    }
  } catch (e: any) {
    return { ok: false, message: 'Gagal mengambil data (Shopee memblokir / timeout). Silakan isi manual.' }
  }
})
