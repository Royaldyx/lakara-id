import { queryOne } from '~/server/utils/db'
import { sendVerificationEmail } from '~/server/utils/verification'
import { checkRateLimit, resetAttempts } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip    = getHeader(event, 'x-forwarded-for') || 'unknown'
  const limit = checkRateLimit(`resend-verif:${ip}`)
  if (!limit.allowed) throw createError({ statusCode: 429, statusMessage: limit.message })

  const body  = await readBody(event)
  const email = (body.email || '').toString().trim().toLowerCase()
  if (!email)
    throw createError({ statusCode: 400, statusMessage: 'Email wajib diisi.' })

  const store = await queryOne<any>('SELECT * FROM stores WHERE member_email = ?', [email])

  // Selalu balas ok — jangan bocorkan apakah email terdaftar
  if (store && !store.email_verified) {
    try { await sendVerificationEmail(store) } catch (e) { console.error('[resend-verif]', e) }
  }

  resetAttempts(`resend-verif:${ip}`)
  return { ok: true }
})
