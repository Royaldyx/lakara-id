import { queryOne, execute } from '~/server/utils/db'
import { requireAdmin, genId, hashPassword, logActivity } from '~/server/utils/portal'

const ROLES = ['staff', 'freelancer']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const b = await readBody(event)
  const action = b.action || 'create'

  if (action === 'toggle_active') {
    if (!b.id) throw createError({ statusCode: 400, statusMessage: 'id wajib.' })
    await execute("UPDATE portal_users SET active = ? WHERE id = ? AND role IN ('staff','freelancer')",
      [b.active ? 1 : 0, b.id])
    await logActivity(event, admin, 'toggle_team', 'user', b.id)
    return { ok: true }
  }

  // create
  const name  = (b.name || '').toString().trim()
  const email = (b.email || '').toString().trim().toLowerCase()
  const pass  = (b.password || '').toString()
  const role  = ROLES.includes(b.role) ? b.role : 'freelancer'
  if (!name || !email || !pass)
    throw createError({ statusCode: 400, statusMessage: 'Nama, email, password wajib.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || pass.length < 6)
    throw createError({ statusCode: 400, statusMessage: 'Email tidak valid atau password < 6 karakter.' })

  const dup = await queryOne('SELECT id FROM portal_users WHERE email = ?', [email])
  if (dup) throw createError({ statusCode: 400, statusMessage: 'Email sudah dipakai.' })

  const id = genId('usr')
  await execute(
    'INSERT INTO portal_users (id, role, name, email, password_hash, phone, active) VALUES (?, ?, ?, ?, ?, ?, 1)',
    [id, role, name, email, hashPassword(pass), b.phone || null]
  )
  await logActivity(event, admin, 'create_team', 'user', id, { role })
  return { ok: true, id }
})
