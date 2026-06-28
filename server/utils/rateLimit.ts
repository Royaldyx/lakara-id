/**
 * Simple in-memory rate limiter.
 * Resets on server restart — acceptable for single-server deployments.
 */

interface Attempt { count: number; firstAt: number; lockedUntil?: number }

const store = new Map<string, Attempt>()

const MAX_ATTEMPTS   = 10
const WINDOW_MS      = 30 * 60 * 1000  // 30 menit
const LOCKOUT_MS     = 10 * 60 * 1000  // 10 menit lockout

export function checkRateLimit(key: string): { allowed: boolean; message?: string } {
  const now    = Date.now()
  const record = store.get(key)

  // Locked?
  if (record?.lockedUntil && now < record.lockedUntil) {
    const mins = Math.ceil((record.lockedUntil - now) / 60000)
    return { allowed: false, message: `Terlalu banyak percobaan. Coba lagi dalam ${mins} menit.` }
  }

  // Reset window if expired
  if (record && (now - record.firstAt) > WINDOW_MS) {
    store.delete(key)
  }

  return { allowed: true }
}

export function recordFailedAttempt(key: string): void {
  const now    = Date.now()
  const record = store.get(key)

  if (!record) {
    store.set(key, { count: 1, firstAt: now })
    return
  }

  record.count++
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS
  }
}

export function resetAttempts(key: string): void {
  store.delete(key)
}
