import { queryOne, execute } from '~/server/utils/db'
import { hashPassword } from '~/server/utils/member'

export default defineEventHandler(async (event) => {
  const body     = await readBody(event)
  const token    = (body.token    || '').toString().trim()
  const password = (body.password || '').toString()

  if (!token)
    throw createError({ statusCode: 400, statusMessage: 'Token tidak valid.' })
  if (!password || password.length < 6)
    throw createError({ statusCode: 400, statusMessage: 'Password minimal 6 karakter.' })
  if (password.length > 100)
    throw createError({ statusCode: 400, statusMessage: 'Password terlalu panjang.' })

  const entry = await queryOne<any>(
    'SELECT * FROM reset_tokens WHERE token = ? AND expires_at > NOW()',
    [token]
  )

  if (!entry)
    throw createError({ statusCode: 400, statusMessage: 'Link reset password tidak valid atau sudah kedaluwarsa.' })

  const storeExists = await queryOne<any>('SELECT id FROM stores WHERE id = ?', [entry.store_id])
  if (!storeExists)
    throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan.' })

  // Reset password lewat link email = bukti kepemilikan email → sekalian verifikasi
  await execute('UPDATE stores SET member_password = ?, email_verified = 1 WHERE id = ?', [hashPassword(password), entry.store_id])
  await execute('DELETE FROM reset_tokens WHERE token = ? OR expires_at <= NOW()', [token])

  return { ok: true }
})
