import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const rows = await query<any>(
    'SELECT id, question, answer, sort_order FROM faqs WHERE active = 1 ORDER BY sort_order ASC, id ASC'
  )
  return { success: true, data: rows }
})
