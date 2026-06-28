import { query } from '~/server/utils/db'
import { requirePortalUser, scopedClientId } from '~/server/utils/portal'

// List konten (kalender). Filter: ?client_id (admin), ?month=YYYY-MM, ?status.
export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const q = getQuery(event)

  const where: string[] = []
  const params: any[] = []

  if (user.role === 'client') {
    if (!user.client_id) throw createError({ statusCode: 400, statusMessage: 'Akun belum terhubung ke perusahaan.' })
    where.push('ct.client_id = ?'); params.push(user.client_id)
  } else {
    const cid = scopedClientId(user, (q.client_id || '').toString())
    if (cid) { where.push('ct.client_id = ?'); params.push(cid) }
  }

  const month = (q.month || '').toString() // YYYY-MM
  if (/^\d{4}-\d{2}$/.test(month)) {
    where.push("DATE_FORMAT(COALESCE(ct.scheduled_at, ct.created_at), '%Y-%m') = ?")
    params.push(month)
  }
  const status = (q.status || '').toString()
  if (status) { where.push('ct.status = ?'); params.push(status) }

  const rows = await query<any>(
    `SELECT ct.id, ct.client_id, ct.brief_id, ct.title, ct.type, ct.status, ct.caption,
            ct.design_file, ct.scheduled_at, ct.published_at, ct.created_at, ct.updated_at,
            c.company_name, b.title AS brief_title
     FROM portal_contents ct
     JOIN portal_clients c ON c.id = ct.client_id
     LEFT JOIN portal_briefs b ON b.id = ct.brief_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY COALESCE(ct.scheduled_at, ct.created_at) ASC`,
    params
  )
  return { ok: true, data: rows }
})
