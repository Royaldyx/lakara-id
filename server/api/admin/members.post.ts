import { checkAuth } from '~/server/utils/data'
import { hashPassword } from '~/server/utils/member'
import { queryOne, execute } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const { store_id, action, email, password, member_active } = await readBody(event)

  if (action === 'create') {
    if (!store_id || !email || !password)
      throw createError({ statusCode: 400, statusMessage: 'store_id, email, dan password wajib diisi.' })
    const exists = await queryOne('SELECT id FROM stores WHERE id = ?', [store_id])
    if (!exists) throw createError({ statusCode: 404, statusMessage: 'Toko tidak ditemukan.' })
    const dup = await queryOne('SELECT id FROM stores WHERE member_email = ?', [email.toLowerCase()])
    if (dup) throw createError({ statusCode: 400, statusMessage: 'Email sudah dipakai akun lain.' })
    await execute(
      'UPDATE stores SET member_email = ?, member_password = ?, member_active = 1, email_verified = 1 WHERE id = ?',
      [email.toLowerCase(), hashPassword(password), store_id]
    )
    return { ok: true }
  }

  const exists = await queryOne('SELECT id FROM stores WHERE id = ?', [store_id])
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'Toko tidak ditemukan.' })

  if (action === 'toggle_active') {
    await execute('UPDATE stores SET member_active = ? WHERE id = ?', [member_active ? 1 : 0, store_id])
    return { ok: true }
  }

  if (action === 'update_creds') {
    if (!email) throw createError({ statusCode: 400, statusMessage: 'Email wajib diisi.' })
    const dup = await queryOne('SELECT id FROM stores WHERE member_email = ? AND id != ?', [email.toLowerCase(), store_id])
    if (dup) throw createError({ statusCode: 400, statusMessage: 'Email sudah dipakai akun lain.' })
    if (password) {
      await execute('UPDATE stores SET member_email = ?, member_password = ?, email_verified = 1 WHERE id = ?', [email.toLowerCase(), hashPassword(password), store_id])
    } else {
      await execute('UPDATE stores SET member_email = ?, email_verified = 1 WHERE id = ?', [email.toLowerCase(), store_id])
    }
    return { ok: true }
  }

  if (action === 'remove_access') {
    // Pakai sentinel unik (bukan '') agar tidak bentrok UNIQUE KEY uk_email
    await execute(
      "UPDATE stores SET member_email = CONCAT('removed_', id, '@lakara.local'), member_password = '', member_active = 0 WHERE id = ?",
      [store_id]
    )
    return { ok: true }
  }

  if (action === 'set_tier') {
    const { tier, months } = await readBody(event)
    if (!['free', 'pro', 'premium'].includes(tier))
      throw createError({ statusCode: 400, statusMessage: 'Tier tidak valid.' })
    if (tier === 'free') {
      await execute(
        "UPDATE stores SET product_tier = 'free', tier_started_at = NULL, tier_expires_at = NULL WHERE id = ?",
        [store_id]
      )
    } else {
      const months_int = parseInt(months) || 1
      const now        = new Date()
      const expires    = new Date()
      expires.setMonth(expires.getMonth() + months_int)
      await execute(
        'UPDATE stores SET product_tier = ?, tier_started_at = ?, tier_expires_at = ? WHERE id = ?',
        [tier, now, expires, store_id]
      )
      // Catat di payments untuk audit history
      const logRef = `ADM-${Date.now()}-${store_id.slice(0, 6)}`
      try {
        await execute(
          `INSERT INTO payments
             (id, tripay_ref, store_id, tier_type, months, amount,
              method, method_type, status, expired_at, paid_at, updated_at)
           VALUES (?, NULL, ?, ?, ?, 0, 'ADMIN', 'direct', 'paid', NOW(), NOW(), NOW())`,
          [logRef, store_id, tier, months_int],
        )
      } catch { /* Jika kolom tidak ada / constraint error, lanjutkan saja */ }
    }
    return { ok: true }
  }

  if (action === 'delete') {
    // Hapus permanen toko + data terkait
    try { await execute('DELETE FROM link_clicks WHERE store_id = ?', [store_id]) } catch { /**/ }
    try { await execute('DELETE FROM upgrade_requests WHERE store_id = ?', [store_id]) } catch { /**/ }
    try { await execute('DELETE FROM reset_tokens WHERE store_id = ?', [store_id]) } catch { /**/ }
    await execute('DELETE FROM stores WHERE id = ?', [store_id])
    return { ok: true }
  }

  throw createError({ statusCode: 400, statusMessage: 'Action tidak valid.' })
})
