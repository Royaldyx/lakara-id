import { checkAuth } from '~/server/utils/data'
import { query } from '~/server/utils/db'
import { cleanupUnusedUploads } from '~/server/utils/uploads'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  // products & links_bio masih berupa JSON string dari DB — collectUploadFiles tetap
  // bisa mendeteksi /api/file/... di dalam string, jadi tidak perlu parse manual.
  const rows = await query<any>('SELECT logo, products, links_bio FROM stores')

  const result = await cleanupUnusedUploads(rows)
  return { ok: true, ...result }
})
