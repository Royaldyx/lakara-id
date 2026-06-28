import { queryOne, execute } from '~/server/utils/db'
import { requirePortalUser, assertClientOwnership, getClientRevisionLimit, genId, logActivity } from '~/server/utils/portal'

// Review konten oleh KLIEN: approve | revise. (Hanya role client, konten miliknya.)
export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  if (user.role !== 'client')
    throw createError({ statusCode: 403, statusMessage: 'Hanya klien yang dapat menyetujui/merevisi konten.' })

  const id = getRouterParam(event, 'id')
  const b = await readBody(event)
  const decision = (b.decision || '').toString() // 'approve' | 'revise'

  const content = await queryOne<any>('SELECT id, client_id, status FROM portal_contents WHERE id = ?', [id])
  if (!content) throw createError({ statusCode: 404, statusMessage: 'Konten tidak ditemukan.' })
  assertClientOwnership(user, content.client_id)

  if (content.status !== 'waiting_approval')
    throw createError({ statusCode: 400, statusMessage: 'Konten ini sedang tidak menunggu persetujuan.' })

  const nextVersion = async () => {
    const r = await queryOne<any>('SELECT COALESCE(MAX(version),0)+1 AS v FROM portal_content_revisions WHERE content_id = ?', [id])
    return Number(r?.v || 1)
  }

  // ---------- APPROVE ----------
  if (decision === 'approve') {
    await execute("UPDATE portal_contents SET status = 'approved' WHERE id = ?", [id])
    await execute(
      `INSERT INTO portal_content_revisions (id, content_id, version, action, user_id)
       VALUES (?, ?, ?, 'approved', ?)`,
      [genId('rev'), id, await nextVersion(), user.id]
    )
    await logActivity(event, user, 'approve_content', 'content', id)
    return { ok: true, status: 'approved' }
  }

  // ---------- REVISE ----------
  if (decision === 'revise') {
    const reason = (b.reason || '').toString().trim()
    if (!reason) throw createError({ statusCode: 400, statusMessage: 'Alasan revisi wajib diisi.' })

    // Enforce limit revisi per paket
    const limit = await getClientRevisionLimit(content.client_id)
    const usedRow = await queryOne<any>(
      "SELECT COUNT(*) AS n FROM portal_content_revisions WHERE content_id = ? AND action = 'revision_requested'",
      [id]
    )
    const used = Number(usedRow?.n || 0)
    if (used >= limit)
      throw createError({
        statusCode: 403,
        statusMessage: `Kuota revisi habis (${used}/${limit}). Silakan buat tiket untuk revisi tambahan.`,
      })

    await execute("UPDATE portal_contents SET status = 'designing' WHERE id = ?", [id])
    await execute(
      `INSERT INTO portal_content_revisions (id, content_id, version, action, reason, user_id)
       VALUES (?, ?, ?, 'revision_requested', ?, ?)`,
      [genId('rev'), id, await nextVersion(), reason, user.id]
    )
    await logActivity(event, user, 'revise_content', 'content', id, { reason })
    return { ok: true, status: 'designing', revision_left: Math.max(0, limit - used - 1) }
  }

  throw createError({ statusCode: 400, statusMessage: 'Keputusan tidak valid (approve/revise).' })
})
