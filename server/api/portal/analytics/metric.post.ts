import { execute } from '~/server/utils/db'
import { requireAdmin, genId, logActivity } from '~/server/utils/portal'

const PLATFORMS = ['instagram', 'facebook', 'tiktok']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const b = await readBody(event)
  const clientId = (b.client_id || '').toString()
  const platform = PLATFORMS.includes(b.platform) ? b.platform : 'instagram'
  const date = (b.metric_date || '').toString() || new Date().toISOString().slice(0, 10)
  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'client_id wajib.' })

  const n = (v: any) => Math.max(0, Math.floor(Number(v) || 0))
  await execute(
    `INSERT INTO portal_social_metrics
       (id, client_id, platform, metric_date, followers, reach, impressions, profile_visits, engagement_rate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [genId('met'), clientId, platform, date, n(b.followers), n(b.reach), n(b.impressions),
     n(b.profile_visits), Number(b.engagement_rate) || 0]
  )
  await logActivity(event, admin, 'add_metric', 'client', clientId, { platform, date })
  return { ok: true }
})
