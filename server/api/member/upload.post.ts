import { getMemberStore } from '~/server/utils/member'
import { getDataDir }     from '~/server/utils/data'
import { query }          from '~/server/utils/db'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, extname }  from 'path'

const IMG_EXTS   = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const VIDEO_EXTS = ['.mp4', '.webm']

// Hard caps (KB)
const STATIC_MAX_KB = 2048   // 2 MB  static image (pro/premium)
const GIF_MAX_KB    = 5120   // 5 MB  animated GIF (premium)
const VIDEO_MAX_KB  = 8192   // 8 MB  wallpaper video (premium)
const FREE_MAX_KB   = 512    // 0.5 MB free static

async function getUploadLimits(): Promise<{ free: number; pro: number }> {
  try {
    const rows = await query<{ key: string; value: string }>(
      "SELECT `key`, `value` FROM settings WHERE `key` IN ('upload_limit_free', 'upload_limit_pro')"
    )
    const map: Record<string, number> = {}
    for (const r of rows) { try { map[r.key] = Number(JSON.parse(r.value)) } catch { /**/ } }
    return { free: map.upload_limit_free || FREE_MAX_KB, pro: map.upload_limit_pro || STATIC_MAX_KB }
  } catch {
    return { free: FREE_MAX_KB, pro: STATIC_MAX_KB }
  }
}

export default defineEventHandler(async (event) => {
  const store = await getMemberStore(event)

  const uploadDir = join(getDataDir(), 'uploads')
  try {
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Gagal membuat folder upload.' })
  }

  const tier      = (store.product_tier || 'free').toString()
  const isPro     = ['pro', 'premium'].includes(tier)
  const isPremium = tier === 'premium'
  const limits    = await getUploadLimits()

  const parts = await readMultipartFormData(event)
  if (!parts?.length) throw createError({ statusCode: 400, statusMessage: 'Tidak ada file.' })

  const results: { url: string }[] = []

  for (const part of parts) {
    if (part.name !== 'file' || !part.data?.length) continue

    const ext     = extname(part.filename || '').toLowerCase()
    const isImg   = IMG_EXTS.includes(ext)
    const isVideo = VIDEO_EXTS.includes(ext)
    if (!isImg && !isVideo)
      throw createError({ statusCode: 400, statusMessage: 'Format tidak didukung (JPG/PNG/WebP/GIF/MP4/WebM).' })

    const isGif = ext === '.gif'

    let maxKB: number
    if (isVideo) {
      if (!isPremium)
        throw createError({ statusCode: 403, statusMessage: 'Upload video khusus member Premium.' })
      maxKB = VIDEO_MAX_KB
    } else if (isGif) {
      if (!isPremium)
        throw createError({ statusCode: 403, statusMessage: 'Upload GIF khusus member Premium. Upgrade untuk pakai GIF.' })
      maxKB = GIF_MAX_KB
    } else {
      maxKB = isPro ? limits.pro : limits.free
    }

    if (part.data.length > maxKB * 1024) {
      const human = maxKB >= 1024 ? (maxKB / 1024) + ' MB' : maxKB + ' KB'
      throw createError({
        statusCode: 400,
        statusMessage: isVideo
          ? `Video melebihi ${human}. Pilih video lebih pendek/kecil.`
          : isGif
            ? `GIF melebihi ${human}. Pilih GIF lebih kecil.`
            : `File melebihi ${human}. Gambar statis otomatis dikompres di browser — coba lagi/pilih lebih kecil.`,
      })
    }

    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`
    writeFileSync(join(uploadDir, filename), part.data)
    results.push({ url: `/api/file/${filename}` })
  }

  if (!results.length) throw createError({ statusCode: 400, statusMessage: 'Tidak ada file valid.' })
  return results.length === 1 ? { ok: true, ...results[0] } : { ok: true, files: results }
})
