import { queryOne, execute } from '~/server/utils/db'
import { checkRateLimit, recordFailedAttempt } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip    = getHeader(event, 'x-forwarded-for') || getHeader(event, 'cf-connecting-ip') || 'unknown'
  const limit = checkRateLimit(`newsletter:${ip}`)
  if (!limit.allowed) throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak request. Coba lagi nanti.' })

  const body  = await readBody(event)
  const email = (body?.email || '').trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    recordFailedAttempt(`newsletter:${ip}`)
    throw createError({ statusCode: 400, statusMessage: 'Email tidak valid.' })
  }

  const exists = await queryOne('SELECT id FROM newsletter WHERE email = ?', [email])
  if (exists) return { ok: true, message: 'Email sudah terdaftar.' }

  await execute(
    'INSERT INTO newsletter (id, email, name, source) VALUES (?, ?, ?, ?)',
    [String(Date.now()), email, body?.name || '', body?.source || 'website']
  )

  return { ok: true, message: 'Berhasil subscribe! Terima kasih.' }
})
