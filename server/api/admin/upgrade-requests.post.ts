import { checkAuth } from '~/server/utils/data'
import { queryOne, execute } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const { request_id, action, months } = await readBody(event)

  const req = await queryOne<any>('SELECT * FROM upgrade_requests WHERE id = ?', [request_id])
  if (!req) throw createError({ statusCode: 404, statusMessage: 'Request tidak ditemukan.' })

  if (action === 'approve') {
    const duration  = Number(months) || 1
    const tierType  = req.tier_type === 'premium' ? 'premium' : 'pro'
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + duration)

    await execute(
      'UPDATE stores SET product_tier = ?, tier_started_at = NOW(), tier_expires_at = ? WHERE id = ?',
      [tierType, expiresAt, req.store_id]
    )
    await execute(
      "UPDATE upgrade_requests SET status = 'approved', approved_months = ?, updated_at = NOW() WHERE id = ?",
      [duration, request_id]
    )

  } else if (action === 'reject') {
    await execute(
      "UPDATE upgrade_requests SET status = 'rejected', updated_at = NOW() WHERE id = ?",
      [request_id]
    )
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Action tidak valid.' })
  }

  return { ok: true }
})
