import { query } from '~/server/utils/db'
import { requirePortalUser } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  // Admin lihat semua (termasuk draft), client hanya published
  const onlyPublished = user.role === 'client'
  const rows = await query<any>(
    `SELECT id, category, title, slug, body, sort_order, published, created_at
     FROM portal_kb_articles ${onlyPublished ? 'WHERE published = 1' : ''}
     ORDER BY category, sort_order ASC, created_at DESC`
  )
  return { ok: true, data: rows }
})
