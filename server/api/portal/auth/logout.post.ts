import { destroyPortalSession } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  await destroyPortalSession(event)
  return { ok: true }
})
