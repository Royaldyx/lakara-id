import { getMemberStore, hashPassword } from '~/server/utils/member'
import { execute } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const store = await getMemberStore(event)
  const { current_password, new_password } = await readBody(event)

  if (!current_password || !new_password)
    throw createError({ statusCode: 400, statusMessage: 'Semua field wajib diisi.' })
  if (new_password.length < 6)
    throw createError({ statusCode: 400, statusMessage: 'Password baru minimal 6 karakter.' })
  if (store.member_password !== hashPassword(current_password))
    throw createError({ statusCode: 401, statusMessage: 'Password saat ini salah.' })

  await execute('UPDATE stores SET member_password = ? WHERE id = ?', [hashPassword(new_password), store.id])

  return { ok: true }
})
