import { query, queryOne } from '~/server/utils/db'
import { requirePortalUser, scopedClientId } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const q = getQuery(event)
  const clientId = scopedClientId(user, (q.client_id || '').toString())
  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'client_id wajib.' })
  const days = Math.min(Math.max(Number(q.days) || 30, 1), 365)

  const accounts = await query<any>(
    'SELECT id, platform, handle, connected FROM portal_social_accounts WHERE client_id = ? ORDER BY platform', [clientId]
  )
  const metrics = await query<any>(
    `SELECT id, platform, metric_date, followers, reach, impressions, profile_visits, engagement_rate
     FROM portal_social_metrics
     WHERE client_id = ? AND metric_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     ORDER BY metric_date DESC`, [clientId, days]
  )
  const latest = await queryOne<any>(
    `SELECT followers, reach, impressions, profile_visits, engagement_rate, metric_date
     FROM portal_social_metrics WHERE client_id = ? ORDER BY metric_date DESC LIMIT 1`, [clientId]
  )

  return { ok: true, accounts, metrics, latest }
})
