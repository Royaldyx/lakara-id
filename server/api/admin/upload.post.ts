import { checkAuth } from '~/server/utils/data'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, extname } from 'path'

const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const MAX_SIZE     = 1.5 * 1024 * 1024 // 1.5MB — cukup untuk foto produk yang sudah dikompres

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const config    = useRuntimeConfig()
  const uploadDir = join(config.dataDir as string, 'uploads')
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })

  const parts = await readMultipartFormData(event)
  if (!parts?.length) throw createError({ statusCode: 400, statusMessage: 'Tidak ada file yang dikirim.' })

  const results: { url: string; filename: string }[] = []

  for (const part of parts) {
    if (part.name !== 'file' || !part.data?.length) continue

    // Validate size
    if (part.data.length > MAX_SIZE) {
      throw createError({ statusCode: 400, statusMessage: `File "${part.filename}" terlalu besar (maks 1.5MB). Kompres dulu di squoosh.app atau tinypng.com.` })
    }

    // Validate extension
    const ext = extname(part.filename || '').toLowerCase()
    if (!ALLOWED_EXTS.includes(ext)) {
      throw createError({ statusCode: 400, statusMessage: `Format "${ext}" tidak didukung. Gunakan JPG, PNG, atau WebP.` })
    }

    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`
    writeFileSync(join(uploadDir, filename), part.data)
    results.push({ url: `/api/file/${filename}`, filename })
  }

  if (!results.length) throw createError({ statusCode: 400, statusMessage: 'Tidak ada file valid yang dikirim.' })

  // Single file: return first; multiple: return array
  return results.length === 1
    ? { ok: true, ...results[0] }
    : { ok: true, files: results }
})
