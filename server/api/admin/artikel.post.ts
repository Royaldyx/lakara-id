import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { checkAuth } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const config = useRuntimeConfig()
  const body   = await readBody(event)
  const file   = resolve(config.dataDir, 'artikel.json')
  const dir    = dirname(file)

  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(file, JSON.stringify(body ?? [], null, 2), 'utf-8')
  return { ok: true }
})
