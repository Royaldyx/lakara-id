import { randomBytes } from 'crypto'
import { execute } from '~/server/utils/db'
import { sendEmail } from '~/server/utils/email'

const escHtml = (s: string) =>
  (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Buat token verifikasi email + kirim email ke member.
 * `store` minimal punya: id, member_email, name.
 */
export async function sendVerificationEmail(store: any): Promise<boolean> {
  const email = (store.member_email || store.email || '').toString().trim().toLowerCase()
  if (!email) return false

  const token     = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 jam

  // Bersihkan token lama untuk store ini + yang sudah expired
  await execute('DELETE FROM email_verifications WHERE store_id = ? OR expires_at <= NOW()', [store.id])
  await execute(
    'INSERT INTO email_verifications (token, store_id, email, expires_at) VALUES (?, ?, ?, ?)',
    [token, store.id, email, expiresAt]
  )

  const config    = useRuntimeConfig()
  const appUrl    = (config.appUrl as string) || 'https://lakara.id'
  const verifyUrl = `${appUrl}/member/verify-email?token=${token}`

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff;">
  <div style="background: #3358ff; padding: 28px 32px; border-radius: 12px 12px 0 0;">
    <span style="color: white; font-size: 20px; font-weight: bold;">✉️ Verifikasi Email Lakara</span>
  </div>
  <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="color: #374151; font-size: 15px; margin-top: 0; line-height: 1.6;">
      Halo <strong>${escHtml(store.name || 'Member Lakara')}</strong>,
    </p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Terima kasih sudah mendaftar di Lakara. Satu langkah lagi — konfirmasi alamat email kamu
      (<strong>${escHtml(email)}</strong>) untuk mengaktifkan akun.
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${verifyUrl}"
         style="display: inline-block; background: #3358ff; color: #ffffff; text-decoration: none;
                padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px;">
        Verifikasi Email Sekarang
      </a>
    </div>
    <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
      ⏰ Link ini berlaku selama <strong>24 jam</strong>.<br>
      Jika kamu tidak merasa mendaftar di Lakara, abaikan email ini.
    </p>
    <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; word-break: break-all;">
      Jika tombol tidak berfungsi, salin link ini ke browser:<br>${verifyUrl}
    </p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
      Email ini dikirim otomatis oleh sistem Lakara. Jangan membalas email ini.<br>
      Butuh bantuan? Hubungi kami di
      <a href="https://wa.me/6285161313693" style="color: #3358ff; text-decoration: none;">WhatsApp</a>.
    </p>
  </div>
</div>`.trim()

  return await sendEmail(email, 'Verifikasi Email Akun Lakara', html)
}
