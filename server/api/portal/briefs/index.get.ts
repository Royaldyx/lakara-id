import { query } from '~/server/utils/db'
import { requirePortalUser, scopedClientId } from '~/server/utils/portal'

// List brief. Client: hanya miliknya. Admin: semua / filter ?client_id & ?status.
export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const q = getQuery(event)
  const status = (q.status || '').toString()

  const where: string[] = []
  const params: any[] = []

  if (user.role === 'client') {
    if (!user.client_id) throw createError({ statusCode: 400, statusMessage: 'Akun belum terhubung ke perusahaan.' })
    where.push('b.client_id = ?'); params.push(user.client_id)
  } else {
    const cid = scopedClientId(user, (q.client_id || '').toString())
    if (cid) { where.push('b.client_id = ?'); params.push(cid) }
  }
  if (status) { where.push('b.status = ?'); params.push(status) }

  const rows = await query<any>(
    `SELECT b.id, b.client_id, b.title, b.objective, b.deadline, b.status, b.created_at, b.updated_at,
            c.company_name,
            (SELECT COUNT(*) FROM portal_contents pc WHERE pc.brief_id = b.id) AS content_count
     FROM portal_briefs b
     JOIN portal_clients c ON c.id = b.client_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY b.created_at DESC`,
    params
  )
  return { ok: true, data: rows }
})
