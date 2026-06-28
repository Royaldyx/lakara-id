import { checkRateLimit, recordFailedAttempt, resetAttempts } from '~/server/utils/rateLimit'
import { createHash } from 'crypto'

// Session token: hash dari password + secret — tidak pernah expose password asli
const makeSessionToken = (pass: string) =>
  createHash('sha256').update(pass + 'lakara_session_v1').digest('hex').slice(0, 32)

export default defineEventHandler(async (event) => {
  const ip    = getHeader(event, 'x-forwarded-for') || getHeader(event, 'cf-connecting-ip') || 'unknown'
  const key   = `admin:${ip}`
  const limit = checkRateLimit(key)
  if (!limit.allowed) throw createError({ statusCode: 429, statusMessage: limit.message })

  const config = useRuntimeConfig()
  const body   = await readBody(event)

  if (body?.password === (config.adminPass as string)) {
    resetAttempts(key)
    const sessionToken = makeSessionToken(config.adminPass as string)
    setCookie(event, 'lakara_admin', 'true', {
      maxAge: 60 * 60 * 8, path: '/', sameSite: 'strict', httpOnly: false,
    })
    return { ok: true, token: sessionToken }
  }

  recordFailedAttempt(key)
  throw createError({ statusCode: 401, statusMessage: 'Username atau password salah.' })
})
