import { queryOne } from '~/server/utils/db'
import { hashPassword, createPortalSession, logActivity } from '~/server/utils/portal'
import { checkRateLimit, recordFailedAttempt, resetAttempts } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip    = getHeader(event, 'x-forwarded-for') || getHeader(event, 'cf-connecting-ip') || 'unknown'
  const key   = `portal-login:${ip}`
  const limit = checkRateLimit(key)
  if (!limit.allowed) throw createError({ statusCode: 429, statusMessage: limit.message })

  const { email, password } = await readBody(event)
  if (!email || !password)
    throw createError({ statusCode: 400, statusMessage: 'Email dan password wajib diisi.' })

  const user = await queryOne<any>(
    'SELECT * FROM portal_users WHERE email = ?',
    [email.trim().toLowerCase()]
  )

  if (!user || user.password_hash !== hashPassword(password)) {
    recordFailedAttempt(key)
    throw createError({ statusCode: 401, statusMessage: 'Email atau password salah.' })
  }
  if (!user.active)
    throw createError({ statusCode: 403, statusMessage: 'Akun kamu dinonaktifkan. Hubungi admin.' })

  await createPortalSession(event, user.id)
  resetAttempts(key)
  await logActivity(event, user, 'login')

  const { password_hash, ...safe } = user
  return { ok: true, user: safe }
})
