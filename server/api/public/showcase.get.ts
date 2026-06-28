import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const rows = await query<any>(
    `SELECT slug, name, tagline, logo, primary_color, instagram, tiktok, whatsapp, youtube,
            product_tier, links_bio
     FROM stores
     WHERE show_on_showcase = 1 AND active = 1 AND member_active = 1
     ORDER BY FIELD(product_tier, 'premium', 'pro', 'free'), created_at DESC
     LIMIT 60`
  )

  const data = rows.map((r: any) => {
    let verified = false
    try {
      const lb = typeof r.links_bio === 'string' ? JSON.parse(r.links_bio) : r.links_bio
      verified = !!(lb && lb.verified)
    } catch { /* abaikan */ }
    return {
      slug:          r.slug,
      name:          r.name,
      tagline:       r.tagline,
      logo:          r.logo,
      primary_color: r.primary_color || '#3358ff',
      tier:          r.product_tier || 'free',
      verified,
      socials: {
        instagram: r.instagram || '',
        tiktok:    r.tiktok || '',
        whatsapp:  r.whatsapp || '',
        youtube:   r.youtube || '',
      },
    }
  })

  return { success: true, data }
})
