import { checkAuth } from '~/server/utils/data'
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const items = await query<any>('SELECT * FROM newsletter ORDER BY created_at DESC')
  return { ok: true, data: items }
})
