import { queryOne } from '~/server/utils/db'
import { requirePortalUser, assertClientOwnership } from '~/server/utils/portal'

// Detail satu brief (+ cek kepemilikan client).
export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const id = getRouterParam(event, 'id')

  const brief = await queryOne<any>(
    `SELECT b.*, c.company_name
     FROM portal_briefs b JOIN portal_clients c ON c.id = b.client_id
     WHERE b.id = ?`, [id]
  )
  if (!brief) throw createError({ statusCode: 404, statusMessage: 'Brief tidak ditemukan.' })
  assertClientOwnership(user, brief.client_id)

  return { ok: true, data: brief }
})
