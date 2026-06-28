import { randomBytes } from 'crypto'
import { queryOne, execute } from '~/server/utils/db'
import { sendEmail } from '~/server/utils/email'

const escHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export default defineEventHandler(async (event) => {
  const body  = await readBody(event)
  const email = (body.email || '').toString().trim().toLowerCase()

  if (!email)
    throw createError({ statusCode: 400, statusMessage: 'Email wajib diisi.' })

  const store = await queryOne<any>('SELECT * FROM stores WHERE member_email = ?', [email])

  // Always return success — don't reveal whether email is registered
  if (!store || store.member_active === 0) return { ok: true }

  const token     = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 jam

  // Hapus token lama untuk store ini + yang expired, lalu insert baru
  await execute('DELETE FROM reset_tokens WHERE store_id = ? OR expires_at <= NOW()', [store.id])
  await execute(
    'INSERT INTO reset_tokens (token, store_id, email, expires_at) VALUES (?, ?, ?, ?)',
    [token, store.id, store.member_email, expiresAt]
  )

  const config   = useRuntimeConfig()
  const appUrl   = (config.appUrl as string) || 'https://lakara.id'
  const resetUrl = `${appUrl}/member/reset-password?token=${token}`

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff;">
  <div style="background: #3358ff; padding: 28px 32px; border-radius: 12px 12px 0 0;">
    <span style="color: white; font-size: 20px; font-weight: bold;">🔑 Reset Password Lakara</span>
  </div>
  <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="color: #374151; font-size: 15px; margin-top: 0; line-height: 1.6;">
      Halo <strong>${escHtml(store.name || 'Member Lakara')}</strong>,
    </p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Kami menerima permintaan reset password untuk akun Lakara Member kamu
      (<strong>${escHtml(store.member_email)}</strong>).
    </p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Klik tombol di bawah untuk membuat password baru:
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${resetUrl}"
         style="display: inline-block; background: #3358ff; color: #ffffff; text-decoration: none;
                padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px;">
        Reset Password Sekarang
      </a>
    </div>
    <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
      ⏰ Link ini berlaku selama <strong>1 jam</strong>.<br>
      Jika kamu tidak meminta reset password, abaikan email ini — akunmu tetap aman.
    </p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
      Email ini dikirim otomatis oleh sistem Lakara. Jangan membalas email ini.<br>
      Butuh bantuan? Hubungi kami di
      <a href="https://wa.me/6285161313693" style="color: #3358ff; text-decoration: none;">WhatsApp</a>.
    </p>
  </div>
</div>`.trim()

  await sendEmail(store.member_email, 'Reset Password Akun Lakara Member', html)

  return { ok: true }
})
