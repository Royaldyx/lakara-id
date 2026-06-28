import { hashPassword, safeMemberStore, parseStore } from '~/server/utils/member'
import { queryOne } from '~/server/utils/db'
import { checkRateLimit, recordFailedAttempt, resetAttempts } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip    = getHeader(event, 'x-forwarded-for') || getHeader(event, 'cf-connecting-ip') || 'unknown'
  const key   = `member:${ip}`
  const limit = checkRateLimit(key)
  if (!limit.allowed) throw createError({ statusCode: 429, statusMessage: limit.message })

  const { email, password } = await readBody(event)

  if (!email || !password)
    throw createError({ statusCode: 400, statusMessage: 'Email dan password wajib diisi.' })

  const store = parseStore(await queryOne<any>(
    'SELECT * FROM stores WHERE member_email = ?',
    [email.trim().toLowerCase()]
  ))

  if (!store?.member_password || store.member_password !== hashPassword(password)) {
    recordFailedAttempt(key)
    throw createError({ statusCode: 401, statusMessage: 'Email atau password salah.' })
  }

  if (store.email_verified === 0 || store.email_verified === false)
    throw createError({
      statusCode: 403,
      statusMessage: 'Email kamu belum diverifikasi. Cek inbox/spam, atau kirim ulang link verifikasi.',
      data: { code: 'EMAIL_NOT_VERIFIED', email: store.member_email },
    })
  if (!store.member_active)
    throw createError({ statusCode: 403, statusMessage: 'Akun member kamu dinonaktifkan. Hubungi admin Lakara.' })
  if (!store.active)
    throw createError({ statusCode: 403, statusMessage: 'Toko kamu sedang nonaktif. Hubungi admin Lakara.' })

  resetAttempts(key)
  setCookie(event, 'lakara_member', store.id, {
    maxAge:   60 * 60 * 24 * 30,
    path:     '/',
    httpOnly: false,
    sameSite: 'strict',
  })

  return { ok: true, store: safeMemberStore(store) }
})
