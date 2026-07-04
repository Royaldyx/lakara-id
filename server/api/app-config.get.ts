import { query } from '~/server/utils/db'

/**
 * Config publik untuk aplikasi mobile (WebView).
 * App buka lakara.id/member?appVersion=x.y.z+build → web bandingkan dengan min_version.
 * Nilai diatur di tabel `settings` (key: app_min_version, app_latest_version, app_update_url)
 * — bisa diubah dari Admin tanpa deploy.
 */
export default defineEventHandler(async () => {
  const map: Record<string, string> = {}
  try {
    const rows = await query<{ key: string; value: string }>(
      "SELECT `key`, `value` FROM settings WHERE `key` IN ('app_min_version', 'app_latest_version', 'app_update_url')"
    )
    for (const r of rows) map[r.key] = r.value
  } catch { /* settings belum ada → default */ }

  return {
    ok: true,
    min_version:    map.app_min_version    || '0.0.0+0', // default: izinkan semua versi
    latest_version: map.app_latest_version || '',
    update_url:     map.app_update_url      || '',
  }
})
