import { checkAuth } from '~/server/utils/data'
import { query, execute, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const body = await readBody(event)
  const { action, id, question, answer, sort_order, active } = body

  if (action === 'create') {
    if (!question?.trim() || !answer?.trim())
      throw createError({ statusCode: 400, statusMessage: 'Pertanyaan dan jawaban wajib diisi.' })
    const maxRow = await queryOne<{ m: number }>('SELECT COALESCE(MAX(sort_order),0) AS m FROM faqs')
    const nextOrder = (maxRow?.m ?? 0) + 1
    await execute(
      'INSERT INTO faqs (question, answer, sort_order, active) VALUES (?, ?, ?, 1)',
      [question.trim(), answer.trim(), sort_order ?? nextOrder]
    )
    const rows = await query<any>('SELECT id, question, answer, sort_order, active FROM faqs ORDER BY sort_order ASC, id ASC')
    return { success: true, data: rows }
  }

  if (action === 'update') {
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi.' })
    const fields: string[] = []
    const values: any[]   = []
    if (question !== undefined)   { fields.push('question = ?');   values.push(question.trim()) }
    if (answer !== undefined)     { fields.push('answer = ?');     values.push(answer.trim()) }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(Number(sort_order)) }
    if (active !== undefined)     { fields.push('active = ?');     values.push(active ? 1 : 0) }
    if (!fields.length) throw createError({ statusCode: 400, statusMessage: 'Tidak ada perubahan.' })
    values.push(id)
    await execute(`UPDATE faqs SET ${fields.join(', ')} WHERE id = ?`, values)
    const rows = await query<any>('SELECT id, question, answer, sort_order, active FROM faqs ORDER BY sort_order ASC, id ASC')
    return { success: true, data: rows }
  }

  if (action === 'delete') {
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi.' })
    await execute('DELETE FROM faqs WHERE id = ?', [id])
    const rows = await query<any>('SELECT id, question, answer, sort_order, active FROM faqs ORDER BY sort_order ASC, id ASC')
    return { success: true, data: rows }
  }

  throw createError({ statusCode: 400, statusMessage: 'Action tidak dikenal.' })
})
