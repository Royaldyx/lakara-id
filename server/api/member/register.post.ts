import { slugify } from '~/server/utils/data'
import { hashPassword } from '~/server/utils/member'
import { queryOne, execute } from '~/server/utils/db'
import { checkRateLimit, resetAttempts } from '~/server/utils/rateLimit'
import { sendVerificationEmail } from '~/server/utils/verification'

const RESERVED_SLUGS = [
  'about', 'contact', 'pricing', 'portfolio', 'services', 'artikel',
  'layanan', 'member', 'admin', 'kalkulator', 'privacy', 'terms',
  'api', 'sitemap', 'favicon', 'robots', 'lakara', 'hapus-akun', 'showcase', 'client',
]

export default defineEventHandler(async (event) => {
  const ip    = getHeader(event, 'x-forwarded-for') || 'unknown'
  const limit = checkRateLimit(`register:${ip}`)
  if (!limit.allowed) throw createError({ statusCode: 429, statusMessage: limit.message })

  const { name, email, password, store_name, store_slug, description, message, ref } = await readBody(event)

  if (!name || !email || !password || !store_name)
    throw createError({ statusCode: 400, statusMessage: 'Nama, email, password, dan nama toko wajib diisi.' })
  if (password.length < 6)
    throw createError({ statusCode: 400, statusMessage: 'Password minimal 6 karakter.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw createError({ statusCode: 400, statusMessage: 'Format email tidak valid.' })

  const slug = slugify(store_slug || store_name)
  if (!slug)
    throw createError({ statusCode: 400, statusMessage: 'URL toko tidak valid. Gunakan huruf, angka, atau tanda hubung.' })

  if (RESERVED_SLUGS.includes(slug))
    throw createError({ statusCode: 400, statusMessage: `Nama toko "${slug}" tidak bisa digunakan. Pilih nama lain.` })

  const emailExists = await queryOne('SELECT id FROM stores WHERE member_email = ?', [email.trim().toLowerCase()])
  if (emailExists) throw createError({ statusCode: 400, statusMessage: 'Email sudah digunakan.' })

  const slugExists = await queryOne('SELECT id FROM stores WHERE slug = ?', [slug])
  if (slugExists) throw createError({ statusCode: 400, statusMessage: `URL toko "/${slug}" sudah dipakai. Pilih nama lain.` })

  const passwordHash = hashPassword(password)
  const storeId      = String(Date.now())

  // Referral: resolve kode (slug pengundang) → id; abaikan kalau tidak valid / diri sendiri
  let referredBy: string | null = null
  const refSlug = (ref || '').toString().trim().toLowerCase()
  if (refSlug && refSlug !== slug) {
    const referrer = await queryOne<any>('SELECT id FROM stores WHERE slug = ?', [refSlug])
    if (referrer) referredBy = referrer.id
  }

  await execute(
    `INSERT INTO stores
     (id, slug, name, tagline, description, logo, primary_color, active, member_active,
      member_email, member_password, instagram, tiktok, whatsapp, youtube, why_buy, products, referred_by)
     VALUES (?, ?, ?, '', ?, '', '#3358ff', 1, 1, ?, ?, '', '', '', '', '[]', '[]', ?)`,
    [storeId, slug, store_name.trim(), description?.trim() || '',
     email.trim().toLowerCase(), passwordHash, referredBy]
  )

  await execute(
    `INSERT INTO pending_members
     (id, name, email, password_hash, store_name, store_slug, description, message, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'auto_approved')`,
    [storeId, name.trim(), email.trim().toLowerCase(), passwordHash,
     store_name.trim(), slug, description?.trim() || '', message?.trim() || '']
  )

  // Kirim email verifikasi (akun belum bisa login sebelum diverifikasi)
  let emailSent = false
  try {
    emailSent = await sendVerificationEmail({
      id: storeId, member_email: email.trim().toLowerCase(), name: store_name.trim(),
    })
  } catch (e) {
    console.error('[register] gagal kirim email verifikasi:', e)
  }

  resetAttempts(`register:${ip}`)
  return { ok: true, needs_verification: true, email_sent: emailSent, email: email.trim().toLowerCase() }
})
