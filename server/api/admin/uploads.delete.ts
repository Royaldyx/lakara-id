import { checkAuth } from '~/server/utils/data'
import { unlinkSync, existsSync } from 'fs'
import { join, basename } from 'path'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const { filename } = await readBody(event)
  if (!filename || filename.includes('..') || filename.includes('/'))
    throw createError({ statusCode: 400, statusMessage: 'Nama file tidak valid.' })

  const config   = useRuntimeConfig()
  const filepath = join(config.dataDir as string, 'uploads', basename(filename))
  if (!existsSync(filepath)) throw createError({ statusCode: 404, statusMessage: 'File tidak ditemukan.' })

  unlinkSync(filepath)
  return { ok: true }
})
