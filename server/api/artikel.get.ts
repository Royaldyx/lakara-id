import { readJson } from '~/server/utils/data'

export default defineEventHandler((event) => {
  const q     = getQuery(event)
  let items   = readJson<any>('artikel.json')

  const isAdmin = getHeader(event, 'x-admin-token') === (useRuntimeConfig().adminPass as string)
  if (!isAdmin) items = items.filter((i: any) => i.published !== false)

  if (q.slug)     return { success: true, data: items.find((i: any) => i.slug === q.slug) || null }
  if (q.category) items = items.filter((i: any) => i.category === q.category)
  if (q.featured !== undefined) items = items.filter((i: any) => i.featured === true)

  items.sort((a: any, b: any) => (b.created_at || b.date || '').localeCompare(a.created_at || a.date || ''))
  if (q.limit) items = items.slice(0, Number(q.limit))

  return { success: true, data: items }
})
