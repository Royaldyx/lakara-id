import { getDataDir } from '~/server/utils/data'
import { queryOne, execute } from '~/server/utils/db'
import { requirePortalUser, assertClientOwnership } from '~/server/utils/portal'
import { unlink } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const id = getRouterParam(event, 'id')

  const asset = await queryOne<any>('SELECT * FROM portal_assets WHERE id = ?', [id])
  if (!asset) throw createError({ statusCode: 404, statusMessage: 'Asset tidak ditemukan.' })
  assertClientOwnership(user, asset.client_id)

  await execute('DELETE FROM portal_assets WHERE id = ?', [id])

  // Hapus file fisik (best-effort)
  const m = (asset.file_path || '').match(/\/api\/file\/([A-Za-z0-9_.\-]+)/)
  if (m) { try { await unlink(join(getDataDir(), 'uploads', m[1])) } catch { /* sudah tidak ada */ } }

  return { ok: true }
})
