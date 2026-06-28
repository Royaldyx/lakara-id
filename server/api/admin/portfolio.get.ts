import { readJson, checkAuth } from '~/server/utils/data'

export default defineEventHandler((event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  return readJson<any>('portfolio.json')
})
