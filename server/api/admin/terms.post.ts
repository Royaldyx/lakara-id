import { checkAuth } from '~/server/utils/data'
import { execute } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const { content } = await readBody(event)
  const value = (content || '').toString()

  await execute(
    "INSERT INTO settings (`key`, `value`) VALUES ('member_terms', ?) ON DUPLICATE KEY UPDATE `value` = ?",
    [value, value]
  )

  return { ok: true }
})
