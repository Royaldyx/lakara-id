import { randomBytes } from 'crypto'
import { query, queryOne, execute } from '~/server/utils/db'
import { hashPassword } from '~/server/utils/member'
import { sendEmail } from '~/server/utils/email'

const escHtmlPortal = (s: string) =>
  (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Email notifikasi sederhana (best-effort, dipanggil dari notify()). */
async function emailNotification(emails: { email: string; name: string }[], title: string, body?: string, link?: string) {
  if (!emails.length) return
  const config  = useRuntimeConfig()
  const appUrl  = (config.appUrl as string) || 'https://lakara.id'
  const fullUrl = link ? (link.startsWith('http') ? link : appUrl + link) : `${appUrl}/client`

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background:#ffffff;">
  <div style="background:#3358ff; padding:24px 28px; border-radius:12px 12px 0 0;">
    <span style="color:white; font-size:18px; font-weight:bold;">🔔 ${escHtmlPortal(title)}</span>
  </div>
  <div style="background:#f8fafc; padding:28px; border:1px solid #e2e8f0; border-top:none; border-radius:0 0 12px 12px;">
    ${body ? `<p style="color:#374151; font-size:15px; line-height:1.6; margin-top:0;">${escHtmlPortal(body)}</p>` : ''}
    <div style="text-align:center; margin:22px 0;">
      <a href="${fullUrl}" style="display:inline-block; background:#3358ff; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:bold; font-size:14px;">Buka Client Portal</a>
    </div>
    <p style="color:#9ca3af; font-size:12px; margin:0; line-height:1.6;">Notifikasi otomatis dari Lakara Client Portal. Jangan balas email ini.</p>
  </div>
</div>`.trim()

  for (const u of emails) {
    try { await sendEmail(u.email, `[Lakara] ${title}`, html) } catch { /* abaikan */ }
  }
}

export type PortalRole = 'super_admin' | 'admin' | 'client'

export interface PortalUser {
  id: string
  role: PortalRole
  name: string
  email: string
  phone: string | null
  avatar: string | null
  client_id: string | null
  active: number
}

const SESSION_COOKIE = 'lakara_portal'
const SESSION_DAYS   = 30

/** Generate ID pendek <=20 char dengan prefix, mis. genId('cl') -> 'cl_lq4d2k_a8f3' */
export function genId(prefix: string): string {
  const t = Date.now().toString(36)
  const r = randomBytes(3).toString('hex')
  return `${prefix}_${t}${r}`.slice(0, 20)
}

/** Buat session baru + set cookie httpOnly */
export async function createPortalSession(event: any, userId: string): Promise<string> {
  const token   = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  const ip      = getHeader(event, 'x-forwarded-for') || getHeader(event, 'cf-connecting-ip') || ''
  const ua      = (getHeader(event, 'user-agent') || '').slice(0, 255)

  await execute(
    'INSERT INTO portal_sessions (token, user_id, ip, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)',
    [token, userId, ip.toString().slice(0, 64), ua, expires]
  )
  await execute('UPDATE portal_users SET last_login_at = NOW() WHERE id = ?', [userId])

  setCookie(event, SESSION_COOKIE, token, {
    maxAge:   SESSION_DAYS * 24 * 60 * 60,
    path:     '/',
    httpOnly: true,
    sameSite: 'lax',
  })
  return token
}

/** Ambil user dari session cookie. Null jika tidak valid/expired/nonaktif. */
export async function getPortalUser(event: any): Promise<PortalUser | null> {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null

  const row = await queryOne<any>(
    `SELECT u.id, u.role, u.name, u.email, u.phone, u.avatar, u.client_id, u.active
     FROM portal_sessions s
     JOIN portal_users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > NOW() AND u.active = 1`,
    [token]
  )
  return row || null
}

/** Wajib login. Throw 401 jika tidak. */
export async function requirePortalUser(event: any): Promise<PortalUser> {
  const user = await getPortalUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Silakan login ke Client Portal.' })
  return user
}

/** Wajib salah satu role. Throw 403 jika tidak cukup hak. */
export async function requireRole(event: any, roles: PortalRole[]): Promise<PortalUser> {
  const user = await requirePortalUser(event)
  if (!roles.includes(user.role))
    throw createError({ statusCode: 403, statusMessage: 'Akses ditolak.' })
  return user
}

export const requireAdmin      = (event: any) => requireRole(event, ['admin', 'super_admin'])
export const requireSuperAdmin = (event: any) => requireRole(event, ['super_admin'])

/**
 * Pastikan role client hanya mengakses datanya sendiri (anti-IDOR).
 * Admin/super_admin lolos. Untuk client, clientId harus == user.client_id.
 */
export function assertClientOwnership(user: PortalUser, clientId: string) {
  if (user.role === 'client' && user.client_id !== clientId)
    throw createError({ statusCode: 403, statusMessage: 'Akses ke data klien lain ditolak.' })
}

/** client_id efektif untuk query: client -> dirinya; admin -> dari parameter. */
export function scopedClientId(user: PortalUser, requested?: string): string {
  if (user.role === 'client') return user.client_id || ''
  return requested || ''
}

/** Limit revisi efektif klien (override langganan > paket). Default 1 jika tak ada langganan. */
export async function getClientRevisionLimit(clientId: string): Promise<number> {
  const row = await queryOne<any>(
    `SELECT COALESCE(s.revision_limit_override, p.revision_limit) AS lim
     FROM portal_subscriptions s JOIN portal_packages p ON p.id = s.package_id
     WHERE s.client_id = ? AND s.status = 'active'
     ORDER BY s.created_at DESC LIMIT 1`,
    [clientId]
  )
  return row ? Number(row.lim) : 1
}

/** Catat audit log (best-effort, tidak boleh memblok request). */
export async function logActivity(
  event: any, user: PortalUser | null, action: string,
  entityType?: string, entityId?: string, meta?: any
) {
  try {
    const ip = (getHeader(event, 'x-forwarded-for') || '').toString().slice(0, 64)
    await execute(
      `INSERT INTO portal_activity_logs (user_id, role, action, entity_type, entity_id, meta, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user?.id || null, user?.role || null, action, entityType || null, entityId || null,
       meta ? JSON.stringify(meta) : null, ip]
    )
  } catch { /* abaikan */ }
}

/** Kirim notifikasi ke 1 atau banyak user. Best-effort. */
export async function notify(
  userIds: string | string[], type: string, title: string, body?: string, link?: string
) {
  const ids = (Array.isArray(userIds) ? userIds : [userIds]).filter(Boolean)
  for (const uid of ids) {
    try {
      await execute(
        'INSERT INTO portal_notifications (id, user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?, ?)',
        [genId('ntf'), uid, type, title.slice(0, 255), body || null, link || null]
      )
    } catch { /* abaikan */ }
  }

  // Kirim email ke tiap penerima (best-effort, tidak boleh blok request)
  try {
    if (ids.length) {
      const ph = ids.map(() => '?').join(',')
      const rows = await query<{ email: string; name: string }>(
        `SELECT email, name FROM portal_users WHERE id IN (${ph}) AND active = 1 AND email IS NOT NULL`,
        ids
      )
      // Fire-and-forget: jangan blok response request dengan SMTP
      emailNotification(rows.filter(r => r.email), title, body, link).catch(() => {})
    }
  } catch { /* abaikan */ }
}

/** Ambil semua user_id admin & super_admin aktif (untuk notif ke tim). */
export async function getAdminUserIds(): Promise<string[]> {
  const rows = await query<{ id: string }>(
    "SELECT id FROM portal_users WHERE role IN ('admin','super_admin') AND active = 1"
  )
  return rows.map(r => r.id)
}

/** Ambil user_id login milik sebuah client (role client). */
export async function getClientUserIds(clientId: string): Promise<string[]> {
  const rows = await query<{ id: string }>(
    "SELECT id FROM portal_users WHERE role = 'client' AND client_id = ? AND active = 1",
    [clientId]
  )
  return rows.map(r => r.id)
}

/** Hapus session aktif + clear cookie */
export async function destroyPortalSession(event: any) {
  const token = getCookie(event, SESSION_COOKIE)
  if (token) await execute('DELETE FROM portal_sessions WHERE token = ?', [token])
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export { hashPassword }
