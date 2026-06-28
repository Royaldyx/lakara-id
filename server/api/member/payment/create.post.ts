import { getMemberStore } from '~/server/utils/member'
import { query, queryOne, execute } from '~/server/utils/db'
import { createTripayTransaction, getAvailableChannels, getTripayConfig, TRIPAY_CHANNELS } from '~/server/utils/tripay'
import { useRuntimeConfig } from '#imports'

async function getSettings(): Promise<Record<string, any>> {
  const rows = await query<{ key: string; value: string }>('SELECT `key`, `value` FROM settings')
  const result: Record<string, any> = {}
  for (const row of rows) {
    try { result[row.key] = JSON.parse(row.value) } catch { result[row.key] = row.value }
  }
  return result
}

export default defineEventHandler(async (event) => {
  const store = await getMemberStore(event)
  const cfg   = useRuntimeConfig()

  const body = await readBody(event)
  const { tier_type, payment_method, months: rawMonths } = body

  const tier    = tier_type === 'premium' ? 'premium' : 'pro'
  const months  = Math.max(1, Math.min(12, Number(rawMonths) || 1))
  // Annual billing: bayar 10 bulan, dapat akses 12 bulan (hemat 2 bln)
  const billedMonths = months === 12 ? 10 : months

  // Validasi tier tidak downgrade
  if (store.product_tier === 'premium')
    throw createError({ statusCode: 400, statusMessage: 'Akun kamu sudah Premium.' })
  if (store.product_tier === 'pro' && tier === 'pro')
    throw createError({ statusCode: 400, statusMessage: 'Akun kamu sudah Pro.' })

  // Cek payment method valid
  const channel = TRIPAY_CHANNELS.find(c => c.code === payment_method)
  if (!channel)
    throw createError({ statusCode: 400, statusMessage: 'Metode pembayaran tidak valid.' })

  // Ambil harga dari settings
  const settings  = await getSettings()
  const unitPrice = tier === 'premium'
    ? (Number(settings.premium_price) || 35000)
    : (Number(settings.pro_price)     || 9000)
  const amount = unitPrice * billedMonths

  // Validasi minimum amount channel
  if (amount < channel.minAmount)
    throw createError({
      statusCode: 400,
      statusMessage: `Nominal terlalu kecil untuk ${channel.name}. Minimum Rp ${channel.minAmount.toLocaleString('id-ID')}.`,
    })

  // Cek tidak ada pending payment aktif
  const existing = await queryOne<any>(
    "SELECT id FROM payments WHERE store_id = ? AND status = 'pending' AND expired_at > NOW()",
    [store.id],
  )
  if (existing)
    throw createError({ statusCode: 400, statusMessage: 'Kamu masih punya pembayaran yang belum selesai.' })

  // Buat merchant_ref unik
  const merchantRef = `LKR-${Date.now()}-${store.id.slice(0, 6)}`

  // Expired 24 jam
  const expiredTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60
  const expiredAt   = new Date(expiredTime * 1000)

  const appUrl      = (cfg.appUrl as string) || 'https://lakara.id'
  const returnUrl   = `${appUrl}/member/payment/${merchantRef}`
  const callbackUrl = `${appUrl}/api/tripay/callback`

  // Buat transaksi di Tripay
  let tripayData: any
  try {
    tripayData = await createTripayTransaction({
      method:         payment_method,
      merchant_ref:   merchantRef,
      amount,
      customer_name:  (store.name || 'Member Lakara').slice(0, 50),
      customer_email: store.member_email && !store.member_email.includes('@lakara.local')
        ? store.member_email
        : 'member@lakara.id',
      order_items: [{
        name:     `Lakara ${tier === 'premium' ? 'Premium' : 'Pro'} ${months} bulan${months === 12 ? ' (hemat 2 bln)' : ''}`,
        price:    unitPrice,
        quantity: billedMonths,
      }],
      return_url:   returnUrl,
      callback_url: callbackUrl,
      expired_time: expiredTime,
    })
  } catch (err: any) {
    // Surface pesan asli dari Tripay (ada di err.data.message)
    const tripayMessage = err?.data?.message
      || (typeof err?.data === 'string' ? err.data : null)
      || err?.message
      || 'Gagal membuat transaksi Tripay.'
    console.error('[Tripay Error]', JSON.stringify({ status: err?.statusCode, data: err?.data }))
    throw createError({ statusCode: 502, statusMessage: tripayMessage })
  }

  // Simpan ke DB
  await execute(
    `INSERT INTO payments
       (id, tripay_ref, store_id, tier_type, months, amount, method, method_type,
        pay_code, pay_url, checkout_url, qr_url, qr_string, status, expired_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      merchantRef,
      tripayData.reference,
      store.id,
      tier,
      months,
      amount,
      payment_method,
      channel.type,
      tripayData.pay_code    || null,
      tripayData.pay_url     || null,
      tripayData.checkout_url || null,
      tripayData.qr_url      || null,
      tripayData.qr_string   || null,
      expiredAt,
    ],
  )

  return {
    ok:          true,
    merchant_ref: merchantRef,
    tripay_ref:  tripayData.reference,
    method:      payment_method,
    method_type: channel.type,
    amount,
    pay_code:    tripayData.pay_code    || null,
    pay_url:     tripayData.pay_url     || null,
    checkout_url: tripayData.checkout_url || null,
    qr_url:      tripayData.qr_url      || null,
    qr_string:   tripayData.qr_string   || null,
    expired_at:  expiredAt.toISOString(),
  }
})
