import { execute } from '~/server/utils/db'
import { slugify } from '~/server/utils/data'
import { requireAdmin, genId } from '~/server/utils/portal'

const CATS = ['faq', 'tutorial', 'guide']

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const b = await readBody(event)
  const title = (b.title || '').toString().trim()
  if (!title) throw createError({ statusCode: 400, statusMessage: 'Judul wajib.' })
  const category = CATS.includes(b.category) ? b.category : 'faq'
  const published = b.published === false ? 0 : 1

  if (b.id) {
    await execute(
      'UPDATE portal_kb_articles SET category = ?, title = ?, body = ?, published = ?, sort_order = ? WHERE id = ?',
      [category, title, b.body || null, published, Number(b.sort_order) || 0, b.id]
    )
    return { ok: true, id: b.id }
  }

  const id = genId('kb')
  const slug = (slugify(title) || 'artikel').slice(0, 140) + '-' + Math.random().toString(36).slice(2, 6)
  await execute(
    'INSERT INTO portal_kb_articles (id, category, title, slug, body, sort_order, published) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, category, title, slug, b.body || null, Number(b.sort_order) || 0, published]
  )
  return { ok: true, id }
})
