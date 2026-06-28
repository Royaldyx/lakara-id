import { checkAuth } from '~/server/utils/data'
import { hashPassword } from '~/server/utils/member'
import { queryOne, execute } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const { storeId, email, password } = await readBody(event)
  if (!storeId) throw createError({ statusCode: 400, statusMessage: 'storeId wajib diisi.' })

  const exists = await queryOne('SELECT id FROM stores WHERE id = ?', [storeId])
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'Toko tidak ditemukan.' })

  if (email !== undefined && password) {
    await execute('UPDATE stores SET member_email = ?, member_password = ? WHERE id = ?',
      [email.trim().toLowerCase(), hashPassword(password), storeId])
  } else if (email !== undefined) {
    await execute('UPDATE stores SET member_email = ? WHERE id = ?',
      [email.trim().toLowerCase(), storeId])
  } else if (password) {
    await execute('UPDATE stores SET member_password = ? WHERE id = ?',
      [hashPassword(password), storeId])
  }

  return { ok: true }
})
