import { checkAuth } from '~/server/utils/data'
import { execute } from '~/server/utils/db'

// Toggle satu toko di showcase tanpa rewrite seluruh tabel (aman).
export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readBody(event)
  const id = (body.id || '').toString()
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id toko wajib.' })

  await execute('UPDATE stores SET show_on_showcase = ? WHERE id = ?', [body.value ? 1 : 0, id])
  return { ok: true }
})
