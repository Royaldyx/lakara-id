import { query } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const rows = await query<{ key: string; value: string }>('SELECT `key`, `value` FROM settings')
  const result: Record<string, any> = {}
  for (const row of rows) {
    try { result[row.key] = JSON.parse(row.value) } catch { result[row.key] = row.value }
  }
  return result
})
