import { query } from '~/server/utils/db'
import { requirePortalUser, scopedClientId } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const clientId = scopedClientId(user, (getQuery(event).client_id || '').toString())
  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'client_id wajib.' })

  const folders = await query<any>(
    'SELECT id, name, created_at FROM portal_folders WHERE client_id = ? ORDER BY name ASC', [clientId]
  )
  const assets = await query<any>(
    `SELECT id, folder_id, category, name, file_path, mime, size, created_at
     FROM portal_assets WHERE client_id = ? ORDER BY created_at DESC`, [clientId]
  )
  return { ok: true, folders, assets }
})
