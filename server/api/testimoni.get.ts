import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const rows = await query<any>(
    'SELECT id, name, role, text, rating, avatar, sort_order FROM testimonials WHERE active = 1 ORDER BY sort_order ASC, id ASC'
  )
  return { success: true, data: rows }
})
