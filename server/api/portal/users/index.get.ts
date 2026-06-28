import { query } from '~/server/utils/db'
import { requireSuperAdmin } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)
  const rows = await query<any>(
    `SELECT id, role, name, email, phone, active, last_login_at, created_at
     FROM portal_users
     WHERE role IN ('admin','super_admin')
     ORDER BY created_at DESC`
  )
  return { ok: true, data: rows }
})
