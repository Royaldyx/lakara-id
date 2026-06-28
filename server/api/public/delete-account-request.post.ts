import { queryOne } from '~/server/utils/db'
import { sendEmail } from '~/server/utils/email'
import { checkRateLimit, resetAttempts } from '~/server/utils/rateLimit'

const escHtml = (s: string) =>
  (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export default defineEventHandler(async (event) => {
  const ip    = getHeader(event, 'x-forwarded-for') || 'unknown'
  const limit = checkRateLimit(`del-acc:${ip}`)
  if (!limit.allowed) throw createError({ statusCode: 429, statusMessage: limit.message })

  const body   = await readBody(event)
  const email  = (body.email || '').toString().trim().toLowerCase()
  const reason = (body.reason || '').toString().trim().slice(0, 1000)

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw createError({ statusCode: 400, statusMessage: 'Format email tidak valid.' })

  const config  = useRuntimeConfig()
  const support = (config.smtpUser as string) || 'support@lakara.id'

  // Cek apakah email terdaftar (tidak dibocorkan ke user)
  const store = await queryOne<any>('SELECT id, name, slug FROM stores WHERE member_email = ?', [email])

  // Notifikasi internal ke tim Lakara
  const internalHtml = `
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #111;">
  <h3>🗑️ Permintaan Hapus Akun</h3>
  <p><strong>Email:</strong> ${escHtml(email)}</p>
  <p><strong>Akun ditemukan:</strong> ${store ? `Ya (toko: ${escHtml(store.name)} — /${escHtml(store.slug)}, id: ${escHtml(store.id)})` : 'Tidak ditemukan'}</p>
  <p><strong>Alasan:</strong> ${reason ? escHtml(reason) : '-'}</p>
  <p><strong>IP:</strong> ${escHtml(ip)}</p>
  <p style="color:#6b7280;">Proses penghapusan via Admin Panel → Members → Delete dalam maks. 30 hari sesuai kebijakan.</p>
</div>`.trim()

  try { await sendEmail(support, `[Lakara] Permintaan Hapus Akun: ${email}`, internalHtml) } catch (e) { console.error('[del-acc] internal mail', e) }

  // Konfirmasi ke user — hanya jika akun ada (hindari enumeration spam)
  if (store) {
    const userHtml = `
<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
  <div style="background: #3358ff; padding: 24px 28px; border-radius: 12px 12px 0 0;">
    <span style="color: white; font-size: 18px; font-weight: bold;">Permintaan Hapus Akun Diterima</span>
  </div>
  <div style="background: #f8fafc; padding: 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="color:#374151; font-size:15px; line-height:1.6; margin-top:0;">
      Halo <strong>${escHtml(store.name || 'Member Lakara')}</strong>,
    </p>
    <p style="color:#374151; font-size:15px; line-height:1.6;">
      Kami menerima permintaan untuk menghapus akun dan data yang terkait dengan email
      <strong>${escHtml(email)}</strong>. Tim kami akan memprosesnya dalam <strong>maksimal 30 hari</strong>.
    </p>
    <p style="color:#374151; font-size:15px; line-height:1.6;">
      Data yang dihapus mencakup: profil toko, link bio, produk, statistik, dan kredensial akun.
      Riwayat transaksi pembayaran dapat disimpan terbatas sesuai kewajiban hukum/akuntansi.
    </p>
    <p style="color:#6b7280; font-size:13px; line-height:1.6;">
      Jika kamu TIDAK mengajukan permintaan ini, segera hubungi kami di
      <a href="https://wa.me/6285161313693" style="color:#3358ff;">WhatsApp</a>.
    </p>
  </div>
</div>`.trim()
    try { await sendEmail(email, 'Konfirmasi Permintaan Hapus Akun Lakara', userHtml) } catch (e) { console.error('[del-acc] user mail', e) }
  }

  resetAttempts(`del-acc:${ip}`)
  // Selalu balas ok agar tidak membocorkan keterdaftaran email
  return { ok: true }
})
