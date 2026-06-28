import { queryOne } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const token = (getQuery(event).token || '').toString().trim()

  if (!token)
    throw createError({ statusCode: 400, statusMessage: 'Token tidak valid.' })

  const entry = await queryOne<any>(
    'SELECT id FROM reset_tokens WHERE token = ? AND expires_at > NOW()',
    [token]
  )

  if (!entry)
    throw createError({ statusCode: 400, statusMessage: 'Link reset password tidak valid atau sudah kedaluwarsa.' })

  return { ok: true }
})
