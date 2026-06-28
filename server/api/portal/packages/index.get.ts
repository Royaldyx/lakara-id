import { query } from '~/server/utils/db'
import { requirePortalUser } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  await requirePortalUser(event)
  const rows = await query<any>(
    'SELECT id, name, price, content_quota, revision_limit, features, active FROM portal_packages WHERE active = 1 ORDER BY sort_order ASC'
  )
  return { ok: true, data: rows }
})
