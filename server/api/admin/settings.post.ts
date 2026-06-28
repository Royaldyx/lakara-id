import { checkAuth } from '~/server/utils/data'
import { getDb } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readBody(event) ?? {}
  const db   = getDb()
  const conn = await db.getConnection()
  await conn.beginTransaction()

  try {
    for (const [key, value] of Object.entries(body)) {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value)
      await conn.execute(
        'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
        [key, serialized, serialized]
      )
    }
    await conn.commit()
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }

  return { ok: true }
})
