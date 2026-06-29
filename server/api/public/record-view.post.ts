import { execute } from '~/server/utils/db'
import { refSource, detectDevice } from '~/server/utils/analytics'

// Sentinel link_id untuk mencatat kunjungan halaman bio (page view).
// Disimpan di tabel link_clicks agar tidak perlu migrasi tabel baru.
export const PAGE_VIEW_ID = '__view__'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const store_id = (body.store_id || '').toString().slice(0, 20)

  if (!store_id) {
    return { ok: false }
  }

  const referrer = refSource(body.ref)
  const device   = detectDevice(getHeader(event, 'user-agent'))

  try {
    await execute(
      'INSERT INTO link_clicks (store_id, link_id, referrer, device) VALUES (?, ?, ?, ?)',
      [store_id, PAGE_VIEW_ID, referrer, device]
    )
  } catch {
    // silently ignore — tracking tidak boleh merusak halaman publik
  }

  return { ok: true }
})
