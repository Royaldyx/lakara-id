import { checkAuth, slugify } from '~/server/utils/data'
import { queryOne, execute } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const { id, action, store_name, store_slug, reject_reason } = await readBody(event)
  if (!id || !action) throw createError({ statusCode: 400 })

  const item = await queryOne<any>('SELECT * FROM pending_members WHERE id = ?', [id])
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Pendaftaran tidak ditemukan.' })

  if (action === 'reject') {
    await execute(
      "UPDATE pending_members SET status = 'rejected', reject_reason = ?, updated_at = NOW() WHERE id = ?",
      [reject_reason || '', id]
    )
    return { ok: true }
  }

  if (action === 'approve') {
    const rawSlug   = (store_slug || item.store_slug || '').trim()
    const finalSlug = slugify(rawSlug)
    if (!finalSlug) throw createError({ statusCode: 400, statusMessage: 'URL toko tidak valid.' })

    const finalName = store_name || item.store_name

    const taken = await queryOne('SELECT id FROM stores WHERE slug = ?', [finalSlug])
    if (taken) throw createError({ statusCode: 400, statusMessage: `Slug "/${finalSlug}" sudah dipakai. Edit slug dulu.` })

    const storeId = String(Date.now())
    await execute(
      `INSERT INTO stores (id, slug, name, tagline, description, logo, primary_color, active, member_active,
       member_email, member_password, instagram, tiktok, whatsapp, youtube, why_buy, products, email_verified)
       VALUES (?, ?, ?, '', ?, '', '#3358ff', 1, 1, ?, ?, '', '', '', '', '[]', '[]', 1)`,
      [storeId, finalSlug, finalName, item.description || '', item.email, item.password_hash]
    )

    await execute(
      "UPDATE pending_members SET status = 'approved', updated_at = NOW() WHERE id = ?",
      [id]
    )

    return { ok: true, storeId }
  }

  throw createError({ statusCode: 400, statusMessage: 'Action tidak valid.' })
})
