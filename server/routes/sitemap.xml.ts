import { readJson } from '~/server/utils/data'
import { query } from '~/server/utils/db'
import { parseStore } from '~/server/utils/member'

const BASE = 'https://lakara.id'

function url(loc: string, priority = '0.8', changefreq = 'monthly', lastmod?: string) {
  return `
  <url>
    <loc>${BASE}${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
  </url>`
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml')

  // Static pages
  const staticPages = [
    { loc: '/',           priority: '1.0', changefreq: 'weekly' },
    { loc: '/services',   priority: '0.9', changefreq: 'monthly' },
    { loc: '/pricing',    priority: '0.9', changefreq: 'monthly' },
    { loc: '/portfolio',  priority: '0.8', changefreq: 'weekly' },
    { loc: '/artikel',    priority: '0.8', changefreq: 'daily' },
    { loc: '/about',      priority: '0.7', changefreq: 'monthly' },
    { loc: '/contact',    priority: '0.7', changefreq: 'monthly' },
    { loc: '/kalkulator', priority: '0.6', changefreq: 'monthly' },
  ]

  // Dynamic: portfolio (masih flat-file)
  const portfolio = readJson<any>('portfolio.json')
    .filter((i: any) => i.published !== false)
  const portfolioUrls = portfolio.map((i: any) => {
    const raw  = i.updated_at?.split('T')[0] || i.date || ''
    const date = raw.length === 7 ? raw + '-01' : raw
    return url(`/portfolio/${i.slug}`, '0.7', 'monthly', date)
  })

  // Dynamic: artikel (masih flat-file)
  const artikel = readJson<any>('artikel.json')
    .filter((i: any) => i.published !== false)
  const artikelUrls = artikel.map((i: any) =>
    url(`/artikel/${i.slug}`, '0.7', 'weekly', i.updated_at?.split('T')[0] || '')
  )

  // Dynamic: toko klien + produk — dari MySQL
  let storeUrls: string[]  = []
  let productUrls: string[] = []
  try {
    const rows   = await query<any>('SELECT slug, products, created_at FROM stores WHERE active = 1')
    const stores = rows.map(parseStore)
    storeUrls    = stores.map((s: any) => url(`/${s.slug}`, '0.6', 'weekly'))
    productUrls  = stores.flatMap((s: any) =>
      (s.products || [])
        .filter((p: any) => p.published !== false)
        .map((p: any) => url(`/${s.slug}/${p.slug}`, '0.7', 'weekly'))
    )
  } catch (e) {
    console.error('[sitemap] DB error:', e)
  }

  const today = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => url(p.loc, p.priority, p.changefreq, today)).join('')}
${portfolioUrls.join('')}
${artikelUrls.join('')}
${storeUrls.join('')}
${productUrls.join('')}
</urlset>`

  return xml
})
