import { queryOne, execute } from '~/server/utils/db'
import { requireAdmin, genId, logActivity } from '~/server/utils/portal'

const CONTENT_TYPE   = ['feed', 'carousel', 'reels', 'story']
const CONTENT_STATUS = ['idea', 'designing', 'waiting_approval', 'approved', 'scheduled', 'published']

// Create / update / set_status / delete konten. ADMIN ONLY (klien hanya melihat & approve).
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const b = await readBody(event)
  const action = b.action || 'create'

  // ---------- CREATE ----------
  if (action === 'create') {
    const clientId = (b.client_id || '').toString()
    if (!clientId) throw createError({ statusCode: 400, statusMessage: 'Klien wajib dipilih.' })
    const client = await queryOne('SELECT id FROM portal_clients WHERE id = ?', [clientId])
    if (!client) throw createError({ statusCode: 404, statusMessage: 'Klien tidak ditemukan.' })

    const title = (b.title || '').toString().trim()
    if (!title) throw createError({ statusCode: 400, statusMessage: 'Judul konten wajib diisi.' })

    const type   = CONTENT_TYPE.includes(b.type) ? b.type : 'feed'
    const status = CONTENT_STATUS.includes(b.status) ? b.status : 'idea'

    let briefId: string | null = null
    if (b.brief_id) {
      const br = await queryOne('SELECT id FROM portal_briefs WHERE id = ? AND client_id = ?', [b.brief_id, clientId])
      if (br) briefId = b.brief_id
    }

    const id = genId('cnt')
    await execute(
      `INSERT INTO portal_contents (id, client_id, brief_id, title, type, status, caption, design_file, scheduled_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clientId, briefId, title, type, status, b.caption || null, b.design_file || null, b.scheduled_at || null, admin.id]
    )
    await logActivity(event, admin, 'create_content', 'content', id)
    return { ok: true, id }
  }

  if (!b.id) throw createError({ statusCode: 400, statusMessage: 'id konten wajib.' })
  const content = await queryOne<any>('SELECT id, client_id, status FROM portal_contents WHERE id = ?', [b.id])
  if (!content) throw createError({ statusCode: 404, statusMessage: 'Konten tidak ditemukan.' })

  // ---------- SET STATUS ----------
  if (action === 'set_status') {
    const status = (b.status || '').toString()
    if (!CONTENT_STATUS.includes(status)) throw createError({ statusCode: 400, statusMessage: 'Status tidak valid.' })
    const extra = status === 'published' ? ', published_at = NOW()' : ''
    await execute(`UPDATE portal_contents SET status = ?${extra} WHERE id = ?`, [status, b.id])
    // Saat dikirim untuk approval, catat di timeline revisi
    if (status === 'waiting_approval') {
      const vRow = await queryOne<any>('SELECT COALESCE(MAX(version),0)+1 AS v FROM portal_content_revisions WHERE content_id = ?', [b.id])
      await execute(
        `INSERT INTO portal_content_revisions (id, content_id, version, action, user_id)
         VALUES (?, ?, ?, 'uploaded', ?)`,
        [genId('rev'), b.id, Number(vRow?.v || 1), admin.id]
      )
    }
    await logActivity(event, admin, 'content_status', 'content', b.id, { status })
    return { ok: true }
  }

  // ---------- UPDATE ----------
  if (action === 'update') {
    const title = (b.title || '').toString().trim()
    if (!title) throw createError({ statusCode: 400, statusMessage: 'Judul konten wajib diisi.' })
    const type = CONTENT_TYPE.includes(b.type) ? b.type : 'feed'
    await execute(
      `UPDATE portal_contents SET title = ?, type = ?, caption = ?, design_file = ?, scheduled_at = ?, brief_id = ?
       WHERE id = ?`,
      [title, type, b.caption || null, b.design_file || null, b.scheduled_at || null, b.brief_id || null, b.id]
    )
    await logActivity(event, admin, 'update_content', 'content', b.id)
    return { ok: true }
  }

  // ---------- DELETE ----------
  if (action === 'delete') {
    await execute('DELETE FROM portal_contents WHERE id = ?', [b.id])
    await logActivity(event, admin, 'delete_content', 'content', b.id)
    return { ok: true }
  }

  throw createError({ statusCode: 400, statusMessage: 'Action tidak dikenal.' })
})
