import { readJsonObj } from '~/server/utils/data'

export default defineEventHandler((event) => {
  const data = readJsonObj<any>('seo.json')
  const page = getQuery(event).page as string | undefined
  if (page && data[page]) return { success: true, data: data[page] }
  return { success: true, data }
})
