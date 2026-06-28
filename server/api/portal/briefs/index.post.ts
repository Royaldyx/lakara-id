import { queryOne, execute } from '~/server/utils/db'
import { requirePortalUser, assertClientOwnership, genId, logActivity } from '~/server/utils/portal'

const BRIEF_STATUS = ['draft', 'submitted', 'in_progress', 'completed']

// Create / update / set_status / delete brief.
export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const b = await readBody(event)
  const action = b.action || 'create'

  // ---------- CREATE ----------
  if (action === 'create') {
    // client_id: client -> dirinya; admin -> wajib dari body
    const clientId = user.role === 'client' ? (user.client_id || '') : (b.client_id || '').toString()
    if (!clientId) throw createError({ statusCode: 400, statusMessage: 'Klien wajib dipilih.' })
    assertClientOwnership(user, clientId)

    const title = (b.title || '').toString().trim()
    if (!title) throw createError({ statusCode: 400, statusMessage: 'Judul brief wajib diisi.' })

    // Client baru bikin brief default status 'submitted'; admin bisa set
    let status = (b.status || (user.role === 'client' ? 'submitted' : 'draft')).toString()
    if (!BRIEF_STATUS.includes(status)) status = 'draft'

    const id = genId('brf')
    await execute(
      `INSERT INTO portal_briefs (id, client_id, title, objective, description, promo, cta, deadline, reference, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clientId, title, b.objective || null, b.description || null, b.promo || null,
       b.cta || null, b.deadline || null, b.reference || null, status, user.id]
    )
    await logActivity(event, user, 'create_brief', 'brief', id)
    return { ok: true, id }
  }

  // Aksi lain butuh id + cek kepemilikan
  if (!b.id) throw createError({ statusCode: 400, statusMessage: 'id brief wajib.' })
  const brief = await queryOne<any>('SELECT id, client_id, status FROM portal_briefs WHERE id = ?', [b.id])
  if (!brief) throw createError({ statusCode: 404, statusMessage: 'Brief tidak ditemukan.' })
  assertClientOwnership(user, brief.client_id)

  // ---------- SET STATUS ----------
  if (action === 'set_status') {
    const status = (b.status || '').toString()
    if (!BRIEF_STATUS.includes(status)) throw createError({ statusCode: 400, statusMessage: 'Status tidak valid.' })
    // Client hanya boleh submit brief draft miliknya
    if (user.role === 'client' && !(brief.status === 'draft' && status === 'submitted'))
      throw createError({ statusCode: 403, statusMessage: 'Klien hanya bisa submit brief draft.' })
    await execute('UPDATE portal_briefs SET status = ? WHERE id = ?', [status, b.id])
    await logActivity(event, user, 'brief_status', 'brief', b.id, { status })
    return { ok: true }
  }

  // ---------- UPDATE ----------
  if (action === 'update') {
    // Client hanya boleh edit brief draft/submitted miliknya
    if (user.role === 'client' && !['draft', 'submitted'].includes(brief.status))
      throw createError({ statusCode: 403, statusMessage: 'Brief sudah diproses, tidak bisa diedit.' })
    const title = (b.title || '').toString().trim()
    if (!title) throw createError({ statusCode: 400, statusMessage: 'Judul brief wajib diisi.' })
    await execute(
      `UPDATE portal_briefs SET title = ?, objective = ?, description = ?, promo = ?, cta = ?, deadline = ?, reference = ?
       WHERE id = ?`,
      [title, b.objective || null, b.description || null, b.promo || null, b.cta || null,
       b.deadline || null, b.reference || null, b.id]
    )
    await logActivity(event, user, 'update_brief', 'brief', b.id)
    return { ok: true }
  }

  // ---------- DELETE ----------
  if (action === 'delete') {
    if (user.role === 'client' && brief.status !== 'draft')
      throw createError({ statusCode: 403, statusMessage: 'Hanya brief draft yang bisa dihapus.' })
    await execute('DELETE FROM portal_briefs WHERE id = ?', [b.id])
    await logActivity(event, user, 'delete_brief', 'brief', b.id)
    return { ok: true }
  }

  throw createError({ statusCode: 400, statusMessage: 'Action tidak dikenal.' })
})
