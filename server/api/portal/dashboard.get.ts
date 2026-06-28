import { query, queryOne } from '~/server/utils/db'
import { requirePortalUser } from '~/server/utils/portal'

const num = (v: any) => Number(v || 0)

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)

  // ===== ADMIN / SUPER ADMIN — ringkasan global =====
  if (user.role === 'admin' || user.role === 'super_admin') {
    const [clients, activeSubs, waiting, openTickets, unpaid] = await Promise.all([
      queryOne<any>('SELECT COUNT(*) AS n FROM portal_clients'),
      queryOne<any>("SELECT COUNT(*) AS n FROM portal_subscriptions WHERE status = 'active'"),
      queryOne<any>("SELECT COUNT(*) AS n FROM portal_contents WHERE status = 'waiting_approval'"),
      queryOne<any>("SELECT COUNT(*) AS n FROM portal_tickets WHERE status != 'closed'"),
      queryOne<any>("SELECT COUNT(*) AS n FROM portal_invoices WHERE status IN ('unpaid','overdue')"),
    ])
    return {
      ok: true, role: user.role,
      stats: {
        total_clients:     num(clients?.n),
        active_subs:       num(activeSubs?.n),
        waiting_approval:  num(waiting?.n),
        open_tickets:      num(openTickets?.n),
        unpaid_invoices:   num(unpaid?.n),
      },
    }
  }

  // ===== CLIENT — ringkasan miliknya =====
  const cid = user.client_id
  if (!cid) throw createError({ statusCode: 400, statusMessage: 'Akun client belum terhubung ke perusahaan.' })

  const [sub, totalMonth, completed, waiting, unpaid, metric] = await Promise.all([
    queryOne<any>(
      `SELECT s.status, p.name AS package_name, p.content_quota, p.revision_limit
       FROM portal_subscriptions s JOIN portal_packages p ON p.id = s.package_id
       WHERE s.client_id = ? AND s.status = 'active' ORDER BY s.created_at DESC LIMIT 1`, [cid]),
    queryOne<any>(
      `SELECT COUNT(*) AS n FROM portal_contents
       WHERE client_id = ? AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())`, [cid]),
    queryOne<any>(
      "SELECT COUNT(*) AS n FROM portal_contents WHERE client_id = ? AND status IN ('approved','scheduled','published')", [cid]),
    queryOne<any>(
      "SELECT COUNT(*) AS n FROM portal_contents WHERE client_id = ? AND status = 'waiting_approval'", [cid]),
    queryOne<any>(
      "SELECT COUNT(*) AS n FROM portal_invoices WHERE client_id = ? AND status IN ('unpaid','overdue')", [cid]),
    queryOne<any>(
      `SELECT followers, reach, impressions, engagement_rate FROM portal_social_metrics
       WHERE client_id = ? ORDER BY metric_date DESC LIMIT 1`, [cid]),
  ])

  return {
    ok: true, role: 'client',
    package: sub ? {
      name: sub.package_name, status: sub.status,
      content_quota: num(sub.content_quota), revision_limit: num(sub.revision_limit),
    } : null,
    stats: {
      content_this_month: num(totalMonth?.n),
      content_completed:  num(completed?.n),
      waiting_approval:   num(waiting?.n),
      unpaid_invoices:    num(unpaid?.n),
    },
    social: metric ? {
      followers: num(metric.followers), reach: num(metric.reach),
      impressions: num(metric.impressions), engagement_rate: Number(metric.engagement_rate || 0),
    } : null,
  }
})
