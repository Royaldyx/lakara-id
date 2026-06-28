import { checkAuth } from '~/server/utils/data'
import { query } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const rows = await query<any>(
    'SELECT id, name, role, text, rating, avatar, sort_order, active FROM testimonials ORDER BY sort_order ASC, id ASC'
  )
  return { success: true, data: rows }
})
