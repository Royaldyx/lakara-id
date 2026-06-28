import { getDataDir } from '~/server/utils/data'
import { unlink, readdir, stat } from 'fs/promises'
import { join } from 'path'

const FILE_RE = /\/api\/file\/([A-Za-z0-9_.\-]+)/g

/** Kumpulkan semua nama file upload (/api/file/xxx) yang dipakai sebuah store. */
export function collectUploadFiles(store: any): Set<string> {
  const set = new Set<string>()
  const scan = (v: any) => {
    if (!v) return
    if (typeof v === 'string') {
      FILE_RE.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = FILE_RE.exec(v))) set.add(m[1])
      return
    }
    if (Array.isArray(v)) { v.forEach(scan); return }
    if (typeof v === 'object') { Object.values(v).forEach(scan) }
  }
  scan(store?.logo)
  scan(store?.products)
  scan(store?.links_bio)
  return set
}

/** Delete-on-replace: hapus file yang ada di oldStore tapi tidak lagi dipakai di newStore. */
export async function deleteOrphanUploads(oldStore: any, newStore: any): Promise<void> {
  try {
    const before = collectUploadFiles(oldStore)
    if (!before.size) return
    const after = collectUploadFiles(newStore)
    const dir = join(getDataDir(), 'uploads')
    for (const f of before) {
      if (!after.has(f)) {
        try { await unlink(join(dir, f)) } catch { /* sudah tidak ada */ }
      }
    }
  } catch { /* jangan sampai gagalin save */ }
}

/**
 * Cleanup global (on-demand): hapus semua file di uploads yang tidak direferensikan
 * store mana pun. Opsi minAgeMs untuk hanya hapus file lebih tua dari N (default 0).
 */
export async function cleanupUnusedUploads(allStores: any[], minAgeMs = 0): Promise<{ deleted: number; kept: number }> {
  const referenced = new Set<string>()
  for (const s of allStores) collectUploadFiles(s).forEach(f => referenced.add(f))

  const dir = join(getDataDir(), 'uploads')
  let deleted = 0, kept = 0
  let files: string[] = []
  try { files = await readdir(dir) } catch { return { deleted: 0, kept: 0 } }

  const now = Date.now()
  for (const f of files) {
    if (referenced.has(f)) { kept++; continue }
    try {
      if (minAgeMs > 0) {
        const st = await stat(join(dir, f))
        if (now - st.mtimeMs < minAgeMs) { kept++; continue }
      }
      await unlink(join(dir, f))
      deleted++
    } catch { /* skip */ }
  }
  return { deleted, kept }
}
