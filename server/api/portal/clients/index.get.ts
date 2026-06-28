import { query } from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  // Subquery (bukan GROUP BY) agar aman dari ONLY_FULL_GROUP_BY
  const rows = await query<any>(
    `SELECT c.id, c.company_name, c.brand_name, c.pic_name, c.email, c.whatsapp,
            c.industry, c.status, c.created_at,
            (SELECT p.name FROM portal_subscriptions s
               JOIN portal_packages p ON p.id = s.package_id
              WHERE s.client_id = c.id AND s.status = 'active'
              ORDER BY s.created_at DESC LIMIT 1) AS package_name,
            (SELECT u.email FROM portal_users u
              WHERE u.client_id = c.id AND u.role = 'client'
              ORDER BY u.created_at ASC LIMIT 1) AS login_email
     FROM portal_clients c
     ORDER BY c.created_at DESC`
  )

  return { ok: true, data: rows }
})
