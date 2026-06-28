import { getDataDir } from '~/server/utils/data'
import { execute } from '~/server/utils/db'
import { requirePortalUser, scopedClientId, genId, logActivity } from '~/server/utils/portal'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, extname } from 'path'

const ALLOWED = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.mp4', '.webm', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip']
const MAX_KB = 20480 // 20 MB per file

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)

  const parts = await readMultipartFormData(event)
  if (!parts?.length) throw createError({ statusCode: 400, statusMessage: 'Tidak ada data.' })

  // Ambil field non-file
  const field = (n: string) => parts.find(p => p.name === n && !p.filename)?.data?.toString().trim() || ''
  const clientId = scopedClientId(user, field('client_id'))
  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'client_id wajib.' })
  const folderId = field('folder_id') || null
  const category = field('category') || null

  const uploadDir = join(getDataDir(), 'uploads')
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })

  const results: any[] = []
  for (const part of parts) {
    if (part.name !== 'file' || !part.filename || !part.data?.length) continue
    const ext = extname(part.filename).toLowerCase()
    if (!ALLOWED.includes(ext))
      throw createError({ statusCode: 400, statusMessage: `Format ${ext} tidak didukung.` })
    if (part.data.length > MAX_KB * 1024)
      throw createError({ statusCode: 400, statusMessage: `File melebihi ${MAX_KB / 1024} MB.` })

    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`
    writeFileSync(join(uploadDir, filename), part.data)
    const id = genId('ast')
    await execute(
      `INSERT INTO portal_assets (id, client_id, folder_id, category, name, file_path, mime, size, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clientId, folderId, category, part.filename.slice(0, 255), `/api/file/${filename}`,
       part.type || null, part.data.length, user.id]
    )
    results.push({ id, name: part.filename, file_path: `/api/file/${filename}` })
  }

  if (!results.length) throw createError({ statusCode: 400, statusMessage: 'Tidak ada file valid.' })
  await logActivity(event, user, 'upload_asset', 'client', clientId, { count: results.length })
  return { ok: true, files: results }
})
