import { createHmac } from 'crypto'
import { useRuntimeConfig } from '#imports'

// ─── Config ─────────────────────────────────────────────────────────────────

export function getTripayConfig() {
  const cfg = useRuntimeConfig()
  const isSandbox = (cfg.tripayMode || 'sandbox') !== 'production'
  return {
    apiKey:       cfg.tripayApiKey       as string,
    privateKey:   cfg.tripayPrivateKey   as string,
    merchantCode: cfg.tripayMerchantCode as string,
    baseUrl:      isSandbox
      ? 'https://tripay.co.id/api-sandbox'
      : 'https://tripay.co.id/api',
    isSandbox,
  }
}

// ─── Channel list (curated) ──────────────────────────────────────────────────

export interface TripayChannel {
  code:      string
  name:      string
  group:     string
  type:      'direct' | 'redirect'
  minAmount: number
  feeFlat:   number
  feePercent: number
}

export const TRIPAY_CHANNELS: TripayChannel[] = [
  { code: 'QRIS',      name: 'QRIS',                   group: 'E-Wallet',       type: 'direct',   minAmount: 1000,  feeFlat: 750,  feePercent: 0.7 },
  { code: 'SHOPEEPAY', name: 'ShopeePay',              group: 'E-Wallet',       type: 'redirect', minAmount: 1000,  feeFlat: 0,    feePercent: 3   },
  { code: 'DANA',      name: 'DANA',                   group: 'E-Wallet',       type: 'redirect', minAmount: 1000,  feeFlat: 0,    feePercent: 3   },
  { code: 'BRIVA',     name: 'BRI Virtual Account',    group: 'Virtual Account', type: 'direct',  minAmount: 10000, feeFlat: 4250, feePercent: 0   },
  { code: 'BNIVA',     name: 'BNI Virtual Account',    group: 'Virtual Account', type: 'direct',  minAmount: 10000, feeFlat: 4250, feePercent: 0   },
  { code: 'MANDIRIVA', name: 'Mandiri Virtual Account', group: 'Virtual Account', type: 'direct', minAmount: 10000, feeFlat: 4250, feePercent: 0   },
  { code: 'BCAVA',     name: 'BCA Virtual Account',    group: 'Virtual Account', type: 'direct',  minAmount: 10000, feeFlat: 5500, feePercent: 0   },
]

/** Kembalikan channels yang valid untuk nominal tertentu */
export function getAvailableChannels(amount: number): TripayChannel[] {
  return TRIPAY_CHANNELS.filter(ch => amount >= ch.minAmount)
}

// ─── Signature ───────────────────────────────────────────────────────────────

/** Signature untuk request transaksi baru (Closed Payment) */
export function createTransactionSignature(
  merchantCode: string,
  merchantRef:  string,
  amount:       number,
  privateKey:   string,
): string {
  return createHmac('sha256', privateKey)
    .update(merchantCode + merchantRef + String(amount))
    .digest('hex')
}

/** Validasi signature callback dari Tripay */
export function verifyCallbackSignature(
  rawBody:    string,
  signature:  string,
  privateKey: string,
): boolean {
  const expected = createHmac('sha256', privateKey)
    .update(rawBody)
    .digest('hex')
  return expected === signature
}

// ─── Tripay API fetch helper ─────────────────────────────────────────────────

export async function tripayFetch<T = any>(
  endpoint:   string,
  method:     'GET' | 'POST',
  body?:      Record<string, any>,
  apiKey?:    string,
  baseUrl?:   string,
): Promise<T> {
  const cfg = getTripayConfig()
  const key = apiKey  || cfg.apiKey
  const url = baseUrl || cfg.baseUrl

  const res = await $fetch<T>(`${url}${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${key}` },
    ...(method === 'POST' ? { body } : { params: body }),
  })
  return res
}

// ─── Create Transaction ───────────────────────────────────────────────────────

export interface TripayTransactionPayload {
  method:         string
  merchant_ref:   string
  amount:         number
  customer_name:  string
  customer_email: string
  order_items:    { name: string; price: number; quantity: number }[]
  return_url:     string
  callback_url:   string
  expired_time:   number   // unix timestamp
}

export interface TripayTransactionResult {
  reference:    string
  merchant_ref: string
  payment_method: string
  pay_code:     string | null
  pay_url:      string | null
  checkout_url: string
  qr_string:    string | null
  qr_url:       string | null
  status:       string
  expired_time: number
}

export async function createTripayTransaction(
  payload: TripayTransactionPayload,
): Promise<TripayTransactionResult> {
  const cfg = getTripayConfig()
  const signature = createTransactionSignature(
    cfg.merchantCode,
    payload.merchant_ref,
    payload.amount,
    cfg.privateKey,
  )

  const res = await tripayFetch<{ success: boolean; message: string; data: TripayTransactionResult }>(
    '/transaction/create',
    'POST',
    { ...payload, signature },
  )

  if (!res.success) throw new Error(res.message || 'Tripay error')
  return res.data
}
