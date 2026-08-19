import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { checkAuth } from '~/server/utils/data'

// Simpan seluruh daftar artikel (frontend kirim FULL array).
// HARDENED (Juli 2026): validasi array + backup otomatis + guard anti-wipe,
// setelah insiden artikel hilang gara-gara file ketimpa data kosong/parsial.
export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  // 1) Body WAJIB array — tolak object/null/undefined (kalau tidak, bisa nimpa jadi rusak)
  if (!Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Format tidak valid: payload harus berupa array artikel.' })
  }

  const file = resolve(config.dataDir as string, 'artikel.json')
  const dir  = dirname(file)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  // 2) Backup + guard anti-wipe berdasarkan isi file lama
  if (existsSync(file)) {
    let prevRaw = ''
    try { prevRaw = readFileSync(file, 'utf-8') } catch { /* ignore */ }

    if (prevRaw) {
      // Rotating backup: .bak (versi sebelumnya) & .bak2 (dua versi lalu)
      try {
        const bak = file + '.bak'
        if (existsSync(bak)) { try { copyFileSync(bak, file + '.bak2') } catch { /* ignore */ } }
        writeFileSync(bak, prevRaw, 'utf-8')
      } catch { /* ignore backup errors, jangan blok simpan */ }

      // Guard: jangan izinkan menimpa daftar BERISI dengan daftar KOSONG (hampir pasti kecelakaan/bug)
      try {
        const prevArr = JSON.parse(prevRaw)
        if (Array.isArray(prevArr) && prevArr.length > 0 && body.length === 0) {
          throw createError({
            statusCode: 409,
            statusMessage: `Dibatalkan: kamu menyimpan daftar KOSONG padahal ada ${prevArr.length} artikel tersimpan. Untuk mencegah kehilangan data, hapus artikel satu per satu, bukan mengosongkan semua sekaligus.`,
          })
        }
      } catch (e: any) {
        if (e?.statusCode === 409) throw e   // re-throw guard
        // kalau JSON lama rusak, lanjut (backup sudah dibuat di atas)
      }
    }
  }

  // 3) Tulis file baru
  writeFileSync(file, JSON.stringify(body, null, 2), 'utf-8')
  return { ok: true, count: body.length }
})
