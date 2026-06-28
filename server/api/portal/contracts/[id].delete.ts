import { execute } from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  await execute('DELETE FROM portal_contracts WHERE id = ?', [id])
  return { ok: true }
})
