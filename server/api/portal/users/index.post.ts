import { queryOne, execute } from '~/server/utils/db'
import { requireSuperAdmin, genId, hashPassword, logActivity } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const admin = await requireSuperAdmin(event)
  const b = await readBody(event)

  const action = b.action || 'create'

  if (action === 'toggle_active') {
    if (!b.id) throw createError({ statusCode: 400, statusMessage: 'id wajib.' })
    if (b.id === admin.id) throw createError({ statusCode: 400, statusMessage: 'Tidak bisa menonaktifkan akun sendiri.' })
    await execute('UPDATE portal_users SET active = ? WHERE id = ? AND role IN (\'admin\',\'super_admin\')',
      [b.active ? 1 : 0, b.id])
    await logActivity(event, admin, 'toggle_admin', 'user', b.id)
    return { ok: true }
  }

  // create
  const name  = (b.name || '').toString().trim()
  const email = (b.email || '').toString().trim().toLowerCase()
  const pass  = (b.password || '').toString()
  const role  = b.role === 'super_admin' ? 'super_admin' : 'admin'

  if (!name || !email || !pass)
    throw createError({ statusCode: 400, statusMessage: 'Nama, email, dan password wajib.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || pass.length < 6)
    throw createError({ statusCode: 400, statusMessage: 'Email tidak valid atau password < 6 karakter.' })

  const dup = await queryOne('SELECT id FROM portal_users WHERE email = ?', [email])
  if (dup) throw createError({ statusCode: 400, statusMessage: 'Email sudah dipakai.' })

  const id = genId('usr')
  await execute(
    `INSERT INTO portal_users (id, role, name, email, password_hash, phone, active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [id, role, name, email, hashPassword(pass), b.phone || null]
  )
  await logActivity(event, admin, 'create_admin', 'user', id, { role })
  return { ok: true, id }
})
