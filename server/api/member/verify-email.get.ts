import { queryOne, execute } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const token = (getQuery(event).token || '').toString().trim()
  if (!token)
    throw createError({ statusCode: 400, statusMessage: 'Token verifikasi tidak ada.' })

  const row = await queryOne<{ store_id: string; email: string }>(
    'SELECT store_id, email FROM email_verifications WHERE token = ? AND expires_at > NOW()',
    [token]
  )

  if (!row) {
    // Cek apakah store dengan token ini sebenarnya sudah terverifikasi sebelumnya
    throw createError({ statusCode: 400, statusMessage: 'Link verifikasi tidak valid atau sudah kedaluwarsa. Silakan kirim ulang.' })
  }

  await execute('UPDATE stores SET email_verified = 1 WHERE id = ?', [row.store_id])
  await execute('DELETE FROM email_verifications WHERE store_id = ?', [row.store_id])

  return { ok: true, email: row.email }
})
