import { execute } from '~/server/utils/db'

// Sentinel link_id untuk mencatat kunjungan halaman bio (page view).
// Disimpan di tabel link_clicks agar tidak perlu migrasi tabel baru.
export const PAGE_VIEW_ID = '__view__'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const store_id = (body.store_id || '').toString().slice(0, 20)

  if (!store_id) {
    return { ok: false }
  }

  try {
    await execute(
      'INSERT INTO link_clicks (store_id, link_id) VALUES (?, ?)',
      [store_id, PAGE_VIEW_ID]
    )
  } catch {
    // silently ignore — tracking tidak boleh merusak halaman publik
  }

  return { ok: true }
})
