import { checkAuth } from '~/server/utils/data'
import { readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler((event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const config    = useRuntimeConfig()
  const uploadDir = join(config.dataDir as string, 'uploads')
  if (!existsSync(uploadDir)) return { ok: true, data: [] }

  const IMAGES = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  const files = readdirSync(uploadDir)
    .filter(f => IMAGES.some(ext => f.toLowerCase().endsWith(ext)))
    .map(f => {
      const stat = statSync(join(uploadDir, f))
      return {
        filename: f,
        url:      `/api/file/${f}`,
        size:     stat.size,
        created:  stat.birthtime.toISOString(),
      }
    })
    .sort((a, b) => b.created.localeCompare(a.created))

  return { ok: true, data: files }
})
