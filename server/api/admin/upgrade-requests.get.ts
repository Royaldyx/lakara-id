import { checkAuth } from '~/server/utils/data'
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const requests = await query<any>('SELECT * FROM upgrade_requests ORDER BY created_at DESC')
  return { ok: true, data: requests }
})
