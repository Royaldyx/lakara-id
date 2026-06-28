import { checkAuth } from '~/server/utils/data'
import { query } from '~/server/utils/db'
import { parseStore } from '~/server/utils/member'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const stores = await query<any>('SELECT * FROM stores ORDER BY created_at DESC')
  return stores.map(parseStore)
})
