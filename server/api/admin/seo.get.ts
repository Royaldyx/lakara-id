import { readJsonObj, checkAuth } from '~/server/utils/data'

export default defineEventHandler((event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  return readJsonObj<any>('seo.json')
})
