import { queryOne } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const row = await queryOne<{ value: string; updated_at: string }>(
    "SELECT `value`, updated_at FROM settings WHERE `key` = 'member_terms'"
  )
  return { ok: true, content: row?.value || '', updated_at: row?.updated_at || '' }
})
