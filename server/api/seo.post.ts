import { readJsonObj, writeJson, checkAuth } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body    = await readBody(event)
  const current = readJsonObj<any>('seo.json')
  const merged  = { ...current, ...body }
  const ok      = writeJson('seo.json', merged)
  if (!ok) throw createError({ statusCode: 500, statusMessage: 'Gagal menyimpan data.' })
  return { success: true }
})
