import { readJson, writeJson, checkAuth, slugify } from '~/server/utils/data'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body   = await readBody(event)
  const action = body.action as string  // 'save' | 'delete' | 'toggle_publish'
  let data     = readJson<any>('portfolio.json')

  if (action === 'delete') {
    data = data.filter((i: any) => i.id !== body.id)
    writeJson('portfolio.json', data)
    return { success: true }
  }

  if (action === 'toggle_publish') {
    data = data.map((i: any) => i.id === body.id ? { ...i, published: !i.published } : i)
    writeJson('portfolio.json', data)
    return { success: true }
  }

  // save (add or edit)
  const item = {
    id:         body.id || String(Date.now()),
    slug:       body.slug || slugify(body.title),
    title:      body.title || '',
    category:   body.category || '',
    client:     body.client || '',
    image:      body.image || '',
    excerpt:    body.excerpt || '',
    content:    body.content || '',
    tags:       Array.isArray(body.tags) ? body.tags : (body.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    link:       body.link || '',
    date:       body.date || '',
    featured:   Boolean(body.featured),
    published:  body.published !== false && body.published !== 'false',
    created_at: body.created_at || new Date().toISOString(),
  }

  if (!item.title) throw createError({ statusCode: 400, statusMessage: 'Judul wajib diisi.' })

  // Check slug uniqueness
  const slugExists = data.find((i: any) => i.slug === item.slug && i.id !== item.id)
  if (slugExists) throw createError({ statusCode: 400, statusMessage: `Slug "${item.slug}" sudah digunakan.` })

  const idx = data.findIndex((i: any) => i.id === item.id)
  if (idx >= 0) data[idx] = item
  else data.push(item)

  const ok = writeJson('portfolio.json', data)
  if (!ok) throw createError({ statusCode: 500, statusMessage: 'Gagal menyimpan data.' })

  return { success: true, data: item }
})
