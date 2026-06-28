import { queryOne, query } from '~/server/utils/db'
import { requirePortalUser, assertClientOwnership, getClientRevisionLimit } from '~/server/utils/portal'

// Detail konten + timeline revisi + sisa kuota revisi.
export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const id = getRouterParam(event, 'id')

  const content = await queryOne<any>(
    `SELECT ct.*, c.company_name, b.title AS brief_title
     FROM portal_contents ct
     JOIN portal_clients c ON c.id = ct.client_id
     LEFT JOIN portal_briefs b ON b.id = ct.brief_id
     WHERE ct.id = ?`, [id]
  )
  if (!content) throw createError({ statusCode: 404, statusMessage: 'Konten tidak ditemukan.' })
  assertClientOwnership(user, content.client_id)

  const revisions = await query<any>(
    `SELECT r.id, r.version, r.action, r.reason, r.created_at, u.name AS user_name, u.role AS user_role
     FROM portal_content_revisions r
     LEFT JOIN portal_users u ON u.id = r.user_id
     WHERE r.content_id = ? ORDER BY r.created_at ASC`, [id]
  )

  const revisionLimit = await getClientRevisionLimit(content.client_id)
  const revisionUsed  = revisions.filter((r) => r.action === 'revision_requested').length

  return {
    ok: true,
    data: content,
    revisions,
    revision_limit: revisionLimit,
    revision_used: revisionUsed,
    revision_left: Math.max(0, revisionLimit - revisionUsed),
  }
})
