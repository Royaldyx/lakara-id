import { execute } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const store_id = (body.store_id || '').toString().slice(0, 20)
  const link_id  = (body.link_id  || '').toString().slice(0, 50)

  if (!store_id || !link_id) {
    return { ok: false }
  }

  try {
    await execute(
      'INSERT INTO link_clicks (store_id, link_id) VALUES (?, ?)',
      [store_id, link_id]
    )
  } catch {
    // silently ignore errors — click tracking should never break the page
  }

  return { ok: true }
})
