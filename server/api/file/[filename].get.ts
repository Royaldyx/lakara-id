import { getDataDir } from '~/server/utils/data'
import { readFileSync, existsSync } from 'fs'
import { join, extname } from 'path'

const MIME: Record<string, string> = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
}

export default defineEventHandler((event) => {
  const filename = event.context.params?.filename ?? ''

  // Security: block path traversal
  if (!filename || /[\/\\.]\./.test(filename)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid filename' })
  }

  const filepath = join(getDataDir(), 'uploads', filename)
  if (!existsSync(filepath)) throw createError({ statusCode: 404, statusMessage: 'File tidak ditemukan.' })

  const mime = MIME[extname(filename).toLowerCase()] ?? 'application/octet-stream'
  setHeader(event, 'Content-Type', mime)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  return readFileSync(filepath)
})
