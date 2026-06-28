import { checkAuth } from '~/server/utils/data'
import { query, execute, queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const body = await readBody(event)
  const { action, id, name, role, text, rating, avatar, sort_order, active } = body

  if (action === 'create') {
    if (!name?.trim() || !text?.trim())
      throw createError({ statusCode: 400, statusMessage: 'Nama dan teks testimoni wajib diisi.' })
    const maxRow = await queryOne<{ m: number }>('SELECT COALESCE(MAX(sort_order),0) AS m FROM testimonials')
    const nextOrder = (maxRow?.m ?? 0) + 1
    await execute(
      'INSERT INTO testimonials (name, role, text, rating, avatar, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [name.trim(), role?.trim() || '', text.trim(), Number(rating ?? 5), avatar?.trim() || '', sort_order ?? nextOrder]
    )
    const rows = await query<any>('SELECT id, name, role, text, rating, avatar, sort_order, active FROM testimonials ORDER BY sort_order ASC, id ASC')
    return { success: true, data: rows }
  }

  if (action === 'update') {
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi.' })
    const fields: string[] = []
    const values: any[]   = []
    if (name !== undefined)       { fields.push('name = ?');       values.push(name.trim()) }
    if (role !== undefined)       { fields.push('role = ?');       values.push(role.trim()) }
    if (text !== undefined)       { fields.push('text = ?');       values.push(text.trim()) }
    if (rating !== undefined)     { fields.push('rating = ?');     values.push(Number(rating)) }
    if (avatar !== undefined)     { fields.push('avatar = ?');     values.push(avatar.trim()) }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(Number(sort_order)) }
    if (active !== undefined)     { fields.push('active = ?');     values.push(active ? 1 : 0) }
    if (!fields.length) throw createError({ statusCode: 400, statusMessage: 'Tidak ada perubahan.' })
    values.push(id)
    await execute(`UPDATE testimonials SET ${fields.join(', ')} WHERE id = ?`, values)
    const rows = await query<any>('SELECT id, name, role, text, rating, avatar, sort_order, active FROM testimonials ORDER BY sort_order ASC, id ASC')
    return { success: true, data: rows }
  }

  if (action === 'delete') {
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi.' })
    await execute('DELETE FROM testimonials WHERE id = ?', [id])
    const rows = await query<any>('SELECT id, name, role, text, rating, avatar, sort_order, active FROM testimonials ORDER BY sort_order ASC, id ASC')
    return { success: true, data: rows }
  }

  throw createError({ statusCode: 400, statusMessage: 'Action tidak dikenal.' })
})
