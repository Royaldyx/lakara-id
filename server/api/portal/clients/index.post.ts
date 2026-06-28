import { queryOne, withTransaction } from '~/server/utils/db'
import { requireAdmin, genId, hashPassword, logActivity } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const b = await readBody(event)

  const company = (b.company_name || '').toString().trim()
  if (!company) throw createError({ statusCode: 400, statusMessage: 'Nama perusahaan wajib diisi.' })

  const loginEmail = (b.login_email || '').toString().trim().toLowerCase()
  const loginPass  = (b.login_password || '').toString()
  if (loginEmail && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail) || loginPass.length < 6))
    throw createError({ statusCode: 400, statusMessage: 'Email login tidak valid atau password < 6 karakter.' })

  if (loginEmail) {
    const dup = await queryOne('SELECT id FROM portal_users WHERE email = ?', [loginEmail])
    if (dup) throw createError({ statusCode: 400, statusMessage: 'Email login sudah dipakai.' })
  }

  // Validasi paket di luar transaksi (read-only)
  let validPackageId: string | null = null
  if (b.package_id) {
    const pkg = await queryOne('SELECT id FROM portal_packages WHERE id = ?', [b.package_id])
    if (pkg) validPackageId = b.package_id
  }

  const clientId = genId('cl')

  // Semua insert dalam satu transaksi: client + akun login + langganan.
  // Kalau salah satu gagal, semua di-rollback (tidak ada data nyangkut).
  await withTransaction(async (tx) => {
    await tx.execute(
      `INSERT INTO portal_clients (id, company_name, brand_name, pic_name, email, whatsapp, website, industry, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [clientId, company, b.brand_name || null, b.pic_name || null, b.email || null,
       b.whatsapp || null, b.website || null, b.industry || null]
    )

    if (loginEmail) {
      await tx.execute(
        `INSERT INTO portal_users (id, role, name, email, password_hash, client_id, active)
         VALUES (?, 'client', ?, ?, ?, ?, 1)`,
        [genId('usr'), b.pic_name || company, loginEmail, hashPassword(loginPass), clientId]
      )
    }

    if (validPackageId) {
      await tx.execute(
        `INSERT INTO portal_subscriptions (id, client_id, package_id, status, start_date)
         VALUES (?, ?, ?, 'active', CURDATE())`,
        [genId('sub'), clientId, validPackageId]
      )
    }
  })

  await logActivity(event, admin, 'create_client', 'client', clientId, { company })
  return { ok: true, id: clientId }
})
