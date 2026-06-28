import { getMemberStore, safeMemberStore } from '~/server/utils/member'
import { execute } from '~/server/utils/db'
import { deleteOrphanUploads } from '~/server/utils/uploads'

const ALLOWED = ['name', 'tagline', 'description', 'logo', 'primary_color',
  'instagram', 'tiktok', 'whatsapp', 'youtube', 'why_buy', 'show_on_showcase',
  'product_image_ratio']

export default defineEventHandler(async (event) => {
  const store = await getMemberStore(event)
  const body  = await readBody(event)

  const updates: Record<string, any> = {}
  for (const key of ALLOWED) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0)
    throw createError({ statusCode: 400, statusMessage: 'Tidak ada perubahan.' })

  const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ')
  const values    = Object.values(updates).map(v => typeof v === 'object' ? JSON.stringify(v) : v)
  values.push(store.id)

  await execute(`UPDATE stores SET ${setClause} WHERE id = ?`, values)

  // Hapus file lama yang sudah tidak dipakai (delete-on-replace)
  await deleteOrphanUploads(store, { ...store, ...updates })

  return { ok: true, data: safeMemberStore({ ...store, ...updates }) }
})
