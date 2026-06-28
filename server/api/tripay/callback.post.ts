import { verifyCallbackSignature } from '~/server/utils/tripay'
import { queryOne, execute } from '~/server/utils/db'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const cfg        = useRuntimeConfig()
  const privateKey = cfg.tripayPrivateKey as string

  // Baca raw body untuk verifikasi signature
  const rawBody   = await readRawBody(event, false) // false = string, bukan buffer
  const signature = getHeader(event, 'x-callback-signature') || ''

  // Validasi signature
  if (!rawBody || !verifyCallbackSignature(rawBody, signature, privateKey)) {
    setResponseStatus(event, 400)
    return { success: false, message: 'Invalid signature' }
  }

  let data: any
  try {
    data = JSON.parse(rawBody)
  } catch {
    setResponseStatus(event, 400)
    return { success: false, message: 'Invalid JSON' }
  }

  // Hanya proses status PAID
  const { merchant_ref, status, reference } = data
  if (status !== 'PAID') {
    // Kalau FAILED/EXPIRED, update status tapi jangan upgrade tier
    if (merchant_ref && (status === 'FAILED' || status === 'EXPIRED')) {
      await execute(
        "UPDATE payments SET status = ?, tripay_ref = ?, updated_at = NOW() WHERE id = ?",
        [status.toLowerCase(), reference || null, merchant_ref],
      )
    }
    return { success: true }
  }

  // Ambil payment record
  const payment = await queryOne<any>(
    'SELECT * FROM payments WHERE id = ?',
    [merchant_ref],
  )
  if (!payment) return { success: true } // idempotent

  // Sudah diproses sebelumnya (idempotent)
  if (payment.status === 'paid') return { success: true }

  // Double-payment dedup: jika store ini punya payment lain yang baru saja dibayar
  // dalam 60 detik terakhir, catat payment ini tapi skip tier upgrade
  const recentOtherPaid = await queryOne<any>(
    `SELECT id FROM payments
     WHERE store_id = ? AND status = 'paid'
       AND paid_at > DATE_SUB(NOW(), INTERVAL 60 SECOND)
       AND id != ?`,
    [payment.store_id, merchant_ref],
  )

  // Update status payment ke paid (selalu dicatat)
  await execute(
    "UPDATE payments SET status = 'paid', tripay_ref = ?, paid_at = NOW(), updated_at = NOW() WHERE id = ?",
    [reference || null, merchant_ref],
  )

  if (recentOtherPaid) {
    // Double-payment terdeteksi — tier sudah diupgrade oleh payment sebelumnya
    console.warn(`[Callback] Double-payment guard: store ${payment.store_id} — payment ${recentOtherPaid.id} baru saja dibayar. Melewati tier upgrade untuk ${merchant_ref}.`)
    return { success: true }
  }

  // Hitung expiry baru (stack dari expiry yg sudah ada atau dari sekarang)
  const store = await queryOne<any>('SELECT product_tier, tier_expires_at FROM stores WHERE id = ?', [payment.store_id])
  const baseDate = (store?.tier_expires_at && new Date(store.tier_expires_at) > new Date())
    ? new Date(store.tier_expires_at)
    : new Date()

  baseDate.setMonth(baseDate.getMonth() + Number(payment.months || 1))

  // Upgrade tier member
  await execute(
    'UPDATE stores SET product_tier = ?, tier_started_at = NOW(), tier_expires_at = ? WHERE id = ?',
    [payment.tier_type, baseDate, payment.store_id],
  )

  // ── Referral reward: pembayaran pertama referee → +1 bln Pro utk kedua pihak ──
  try {
    const refee = await queryOne<any>(
      'SELECT referred_by, referral_rewarded FROM stores WHERE id = ?', [payment.store_id]
    )
    if (refee?.referred_by && !refee.referral_rewarded) {
      // Referee: tambah 1 bulan dari expiry yang baru saja diset
      const refeeExp = new Date(baseDate); refeeExp.setMonth(refeeExp.getMonth() + 1)
      await execute(
        'UPDATE stores SET tier_expires_at = ?, referral_rewarded = 1 WHERE id = ?',
        [refeeExp, payment.store_id]
      )

      // Pengundang: +1 bulan Pro (jangan turunkan kalau sudah premium)
      const referrer = await queryOne<any>(
        'SELECT product_tier, tier_expires_at FROM stores WHERE id = ?', [refee.referred_by]
      )
      if (referrer) {
        const base = (referrer.tier_expires_at && new Date(referrer.tier_expires_at) > new Date())
          ? new Date(referrer.tier_expires_at) : new Date()
        base.setMonth(base.getMonth() + 1)
        const newTier = referrer.product_tier === 'premium' ? 'premium' : 'pro'
        await execute(
          'UPDATE stores SET product_tier = ?, tier_started_at = COALESCE(tier_started_at, NOW()), tier_expires_at = ? WHERE id = ?',
          [newTier, base, refee.referred_by]
        )
      }
    }
  } catch (e) {
    console.error('[Callback] Referral reward gagal:', e)
  }

  return { success: true }
})
