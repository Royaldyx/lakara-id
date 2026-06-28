import { checkAuth } from '~/server/utils/data'
import { execute } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const { id } = await readBody(event)
  await execute('DELETE FROM newsletter WHERE id = ?', [id])
  return { ok: true }
})
