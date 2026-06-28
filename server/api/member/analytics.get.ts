import { getMemberStore } from '~/server/utils/member'
import { query } from '~/server/utils/db'

const PAGE_VIEW_ID = '__view__'

export default defineEventHandler(async (event) => {
  const store = await getMemberStore(event)

  if (!['pro', 'premium'].includes(store.product_tier || '')) {
    throw createError({ statusCode: 403, statusMessage: 'Fitur analytics tersedia untuk member Pro dan Premium.' })
  }

  const urlQuery = getQuery(event)
  const days = Math.min(Math.max(Number(urlQuery.days) || 30, 1), 90)
  const isPremium = store.product_tier === 'premium'

  // --- Total klik & view periode sekarang (N hari terakhir) ---
  const totalsNow = await query<{ kind: string; total: number }>(
    `SELECT CASE WHEN link_id = ? THEN 'view' ELSE 'click' END AS kind, COUNT(*) AS total
     FROM link_clicks
     WHERE store_id = ?
       AND clicked_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY kind`,
    [PAGE_VIEW_ID, store.id, days]
  )
  const clicks = Number(totalsNow.find(r => r.kind === 'click')?.total || 0)
  const views  = Number(totalsNow.find(r => r.kind === 'view')?.total || 0)

  // --- Periode sebelumnya (untuk hitung pertumbuhan %) ---
  const totalsPrev = await query<{ kind: string; total: number }>(
    `SELECT CASE WHEN link_id = ? THEN 'view' ELSE 'click' END AS kind, COUNT(*) AS total
     FROM link_clicks
     WHERE store_id = ?
       AND clicked_at <  DATE_SUB(NOW(), INTERVAL ? DAY)
       AND clicked_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY kind`,
    [PAGE_VIEW_ID, store.id, days, days * 2]
  )
  const clicksPrev = Number(totalsPrev.find(r => r.kind === 'click')?.total || 0)
  const viewsPrev  = Number(totalsPrev.find(r => r.kind === 'view')?.total || 0)

  // --- Klik hari ini ---
  const todayRows = await query<{ total: number }>(
    `SELECT COUNT(*) AS total
     FROM link_clicks
     WHERE store_id = ?
       AND link_id <> ?
       AND DATE(clicked_at) = CURDATE()`,
    [store.id, PAGE_VIEW_ID]
  )
  const clicksToday = Number(todayRows[0]?.total || 0)

  // --- Klik per link (kecuali page view) ---
  const rows = await query<{ link_id: string; total: number }>(
    `SELECT link_id, COUNT(*) AS total
     FROM link_clicks
     WHERE store_id = ?
       AND link_id <> ?
       AND clicked_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY link_id
     ORDER BY total DESC`,
    [store.id, PAGE_VIEW_ID, days]
  )

  // --- Series harian klik + view (Premium dapat seluruh range, Pro 7 hari terakhir) ---
  const dailyDays = isPremium ? days : Math.min(days, 7)
  const dailyRows = await query<{ date: string; clicks: number; views: number }>(
    `SELECT DATE(clicked_at) AS date,
            SUM(CASE WHEN link_id = ? THEN 0 ELSE 1 END) AS clicks,
            SUM(CASE WHEN link_id = ? THEN 1 ELSE 0 END) AS views
     FROM link_clicks
     WHERE store_id = ?
       AND clicked_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY DATE(clicked_at)
     ORDER BY date ASC`,
    [PAGE_VIEW_ID, PAGE_VIEW_ID, store.id, dailyDays]
  )

  const pct = (now: number, prev: number) =>
    prev === 0 ? (now > 0 ? 100 : 0) : Math.round(((now - prev) / prev) * 100)

  return {
    ok:   true,
    days,
    tier: store.product_tier,
    totals: {
      clicks,
      views,
      clicks_today: clicksToday,
      ctr:          views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0, // % 1 desimal
      clicks_growth: pct(clicks, clicksPrev),
      views_growth:  pct(views, viewsPrev),
    },
    by_link: rows.map(r => ({ link_id: r.link_id, total: Number(r.total) })),
    daily:   dailyRows.map(r => ({
      date:   typeof r.date === 'string' ? r.date : new Date(r.date).toISOString().slice(0, 10),
      clicks: Number(r.clicks),
      views:  Number(r.views),
    })),
  }
})
