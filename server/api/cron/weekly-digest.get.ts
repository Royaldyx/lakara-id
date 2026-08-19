import { query } from '~/server/utils/db'
import { sendEmail } from '~/server/utils/email'
import { useRuntimeConfig } from '#imports'

// Cron: kirim email ringkasan mingguan ke member yang aktif (ada kunjungan 7 hari terakhir).
// Dipanggil cron cPanel (mingguan, mis. Senin pagi):
//   curl -s "https://lakara.id/api/cron/weekly-digest?key=SECRET"
// Opsi:
//   &dry=1          → hitung saja, tidak kirim email
//   &test=EMAIL     → kirim SEMUA ke satu alamat uji (buat cek tampilan)
//   &limit=N        → batasi jumlah penerima (default semua)
const PAGE_VIEW_ID = '__view__'

function pct(now: number, prev: number) {
  if (prev === 0) return now > 0 ? 100 : 0
  return Math.round(((now - prev) / prev) * 100)
}

function parseBio(raw: any): any {
  if (!raw) return {}
  if (typeof raw === 'object') return raw
  try { return JSON.parse(raw) } catch { return {} }
}

function digestHtml(opts: {
  appUrl: string; name: string; slug: string;
  clicks: number; clicksGrowth: number; views: number; topLabel: string; topClicks: number;
}) {
  const { appUrl, name, slug, clicks, clicksGrowth, views, topLabel, topClicks } = opts
  const up = clicksGrowth >= 0
  const growthColor = up ? '#16a34a' : '#dc2626'
  const growthText = `${up ? '▲' : '▼'} ${Math.abs(clicksGrowth)}% vs minggu lalu`
  const bioUrl = `${appUrl}/${slug}`
  const dashUrl = `${appUrl}/member/analytics`
  return `<!DOCTYPE html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;margin-bottom:16px;">
      <span style="font-size:20px;font-weight:800;color:#3358ff;">Lakara</span>
    </div>
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 6px 24px rgba(15,23,42,0.06);">
      <div style="background:linear-gradient(135deg,#3358ff,#7c3aed);padding:24px 24px 20px;color:#fff;">
        <div style="font-size:13px;opacity:.85;">Ringkasan mingguan</div>
        <div style="font-size:20px;font-weight:800;margin-top:2px;">Halo ${name || slug}! 👋</div>
        <div style="font-size:13px;opacity:.9;margin-top:6px;">Ini performa link bio kamu 7 hari terakhir.</div>
      </div>
      <div style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
          <tr>
            <td style="width:50%;padding:14px;background:#f8fafc;border-radius:14px;text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#0f172a;">${clicks}</div>
              <div style="font-size:12px;color:#64748b;">Klik link</div>
              <div style="font-size:11px;font-weight:700;color:${growthColor};margin-top:4px;">${growthText}</div>
            </td>
            <td style="width:8px;"></td>
            <td style="width:50%;padding:14px;background:#f8fafc;border-radius:14px;text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#0f172a;">${views}</div>
              <div style="font-size:12px;color:#64748b;">Kunjungan halaman</div>
            </td>
          </tr>
        </table>
        ${topLabel ? `<div style="padding:14px;background:#eef2ff;border-radius:14px;margin-top:8px;">
          <div style="font-size:12px;color:#64748b;">🔥 Link paling diklik</div>
          <div style="font-size:15px;font-weight:700;color:#1e293b;margin-top:2px;">${topLabel} <span style="color:#3358ff;">(${topClicks}×)</span></div>
        </div>` : ''}
        <a href="${dashUrl}" style="display:block;text-align:center;background:#3358ff;color:#fff;text-decoration:none;font-weight:700;padding:13px;border-radius:14px;margin-top:18px;">Lihat analitik lengkap →</a>
        <a href="${bioUrl}" style="display:block;text-align:center;color:#3358ff;text-decoration:none;font-weight:600;font-size:13px;padding:10px;">Buka link bio kamu</a>
      </div>
    </div>
    <div style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px;line-height:1.6;">
      Kamu terima email ini karena punya akun aktif di Lakara.<br>
      ${appUrl}
    </div>
  </div></body></html>`
}

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  const secret = (cfg.cronSecret as string) || (cfg.adminPass as string) || ''
  const q = getQuery(event)
  const key = (q.key || '').toString()
  if (!secret || key !== secret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const appUrl = (cfg.appUrl as string) || 'https://lakara.id'
  const dry = q.dry === '1' || q.dry === 'true'
  const testEmail = (q.test || '').toString().trim()
  const limit = Math.max(0, Number(q.limit) || 0)

  // 1) View & klik per store — 7 hari terakhir
  const views7 = await query<{ store_id: string; total: number }>(
    `SELECT store_id, COUNT(*) total FROM link_clicks
     WHERE link_id = ? AND clicked_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     GROUP BY store_id`, [PAGE_VIEW_ID])
  const clicks7 = await query<{ store_id: string; total: number }>(
    `SELECT store_id, COUNT(*) total FROM link_clicks
     WHERE link_id <> ? AND clicked_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     GROUP BY store_id`, [PAGE_VIEW_ID])
  const clicksPrev = await query<{ store_id: string; total: number }>(
    `SELECT store_id, COUNT(*) total FROM link_clicks
     WHERE link_id <> ? AND clicked_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
       AND clicked_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
     GROUP BY store_id`, [PAGE_VIEW_ID])
  // Top link per store (7 hari) — semua baris, pilih max di JS
  const perLink = await query<{ store_id: string; link_id: string; c: number }>(
    `SELECT store_id, link_id, COUNT(*) c FROM link_clicks
     WHERE link_id <> ? AND clicked_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     GROUP BY store_id, link_id`, [PAGE_VIEW_ID])

  const viewMap  = new Map(views7.map(r => [r.store_id, Number(r.total)]))
  const clickMap = new Map(clicks7.map(r => [r.store_id, Number(r.total)]))
  const prevMap  = new Map(clicksPrev.map(r => [r.store_id, Number(r.total)]))
  const topMap = new Map<string, { link_id: string; c: number }>()
  for (const r of perLink) {
    const cur = topMap.get(r.store_id)
    if (!cur || Number(r.c) > cur.c) topMap.set(r.store_id, { link_id: r.link_id, c: Number(r.c) })
  }

  // 2) Target = store dengan view > 0, punya email aktif & terverifikasi
  const activeIds = [...viewMap.keys()].filter(id => (viewMap.get(id) || 0) > 0)
  if (activeIds.length === 0) return { ok: true, sent: 0, note: 'Tidak ada member aktif minggu ini.' }

  const placeholders = activeIds.map(() => '?').join(',')
  let stores = await query<any>(
    `SELECT id, slug, name, member_email, links_bio FROM stores
     WHERE id IN (${placeholders})
       AND member_email IS NOT NULL AND member_email <> ''
       AND member_active = 1 AND (email_verified = 1 OR email_verified IS NULL)`,
    activeIds
  )
  if (limit > 0) stores = stores.slice(0, limit)

  let sent = 0, failed = 0
  const results: any[] = []
  for (const s of stores) {
    const clicks = clickMap.get(s.id) || 0
    const views  = viewMap.get(s.id) || 0
    const growth = pct(clicks, prevMap.get(s.id) || 0)
    const top    = topMap.get(s.id)
    let topLabel = '', topClicks = 0
    if (top) {
      topClicks = top.c
      const bio = parseBio(s.links_bio)
      const link = (bio.links || []).find((l: any) => l.id === top.link_id)
      topLabel = (link?.label || link?.type || '').toString().slice(0, 40)
    }
    const html = digestHtml({ appUrl, name: s.name, slug: s.slug, clicks, clicksGrowth: growth, views, topLabel, topClicks })
    const to = testEmail || s.member_email

    if (dry) { results.push({ slug: s.slug, to, clicks, views, growth, topLabel }); continue }
    const ok = await sendEmail(to, `📊 Link bio kamu minggu ini: ${clicks} klik, ${views} kunjungan`, html)
    ok ? sent++ : failed++
    if (testEmail) break // mode uji: cukup 1 email
  }

  return { ok: true, candidates: stores.length, sent, failed, dry, ...(dry ? { preview: results.slice(0, 20) } : {}) }
})
