import { getDataDir } from '~/server/utils/data'
import { execute } from '~/server/utils/db'
import { requireAdmin, genId, notify, logActivity } from '~/server/utils/portal'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, extname } from 'path'

const RATE_TYPES = ['hourly', 'per_task', 'monthly']
const ALLOWED = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const parts = await readMultipartFormData(event)
  if (!parts?.length) throw createError({ statusCode: 400, statusMessage: 'Tidak ada data.' })
  const field = (n: string) => parts.find(p => p.name === n && !p.filename)?.data?.toString().trim() || ''

  const userId = field('user_id')
  const title = field('title')
  if (!userId || !title) throw createError({ statusCode: 400, statusMessage: 'Anggota & judul wajib.' })
  const rateType = RATE_TYPES.includes(field('rate_type')) ? field('rate_type') : 'per_task'

  // Upload file MOU (opsional)
  let filePath: string | null = null
  const filePart = parts.find(p => p.name === 'file' && p.filename && p.data?.length)
  if (filePart) {
    const ext = extname(filePart.filename!).toLowerCase()
    if (!ALLOWED.includes(ext)) throw createError({ statusCode: 400, statusMessage: `Format ${ext} tidak didukung.` })
    if (filePart.data!.length > 10 * 1024 * 1024) throw createError({ statusCode: 400, statusMessage: 'File melebihi 10 MB.' })
    const dir = join(getDataDir(), 'uploads')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`
    writeFileSync(join(dir, filename), filePart.data!)
    filePath = `/api/file/${filename}`
  }

  const id = genId('ctr')
  await execute(
    `INSERT INTO portal_contracts (id, user_id, title, file_path, rate_type, rate, scope, start_date, end_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [id, userId, title, filePath, rateType, Math.max(0, Number(field('rate')) || 0),
     field('scope') || null, field('start_date') || null, field('end_date') || null]
  )
  await notify(userId, 'status_change', `Kontrak baru: ${title}`, 'Cek detail kontrak/MOU kamu.', '/client/my-contract')
  await logActivity(event, admin, 'create_contract', 'user', userId)
  return { ok: true, id }
})
