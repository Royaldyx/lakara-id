import { checkAuth } from '~/server/utils/data'
import { execute, getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body: any[] = await readBody(event)
  if (!Array.isArray(body)) throw createError({ statusCode: 400, statusMessage: 'Body harus array.' })

  const db   = getDb()
  const conn = await db.getConnection()
  await conn.beginTransaction()

  try {
    await conn.execute('DELETE FROM stores')
    for (const s of body) {
      await conn.execute(
        `INSERT INTO stores (id, slug, name, tagline, description, logo, primary_color, active, member_active,
         member_email, member_password, instagram, tiktok, whatsapp, youtube, why_buy, products, links_bio,
         product_tier, tier_started_at, tier_expires_at, show_on_showcase, product_image_ratio, email_verified,
         referred_by, referral_rewarded, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          s.id, s.slug, s.name, s.tagline || '', s.description || '',
          s.logo || '', s.primary_color || '#3358ff',
          s.active !== false ? 1 : 0, s.member_active !== false ? 1 : 0,
          s.member_email || '', s.member_password || '',
          s.instagram || '', s.tiktok || '', s.whatsapp || '', s.youtube || '',
          JSON.stringify(s.why_buy || []), JSON.stringify(s.products || []),
          s.links_bio ? JSON.stringify(s.links_bio) : null,
          s.product_tier || 'free', s.tier_started_at || null, s.tier_expires_at || null,
          s.show_on_showcase ? 1 : 0, s.product_image_ratio || '1:1', s.email_verified === 0 ? 0 : 1,
          s.referred_by || null, s.referral_rewarded ? 1 : 0,
          s.created_at || new Date(),
        ]
      )
    }
    await conn.commit()
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }

  return { ok: true }
})
