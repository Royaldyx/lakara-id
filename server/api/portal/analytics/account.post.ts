import { execute } from '~/server/utils/db'
import { requirePortalUser, scopedClientId, genId } from '~/server/utils/portal'

const PLATFORMS = ['instagram', 'facebook', 'tiktok']

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const b = await readBody(event)
  const clientId = scopedClientId(user, b.client_id)
  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'client_id wajib.' })
  const platform = PLATFORMS.includes(b.platform) ? b.platform : 'instagram'
  const handle = (b.handle || '').toString().trim().slice(0, 120)
  if (!handle) throw createError({ statusCode: 400, statusMessage: 'Handle/username wajib.' })

  await execute(
    `INSERT INTO portal_social_accounts (id, client_id, platform, handle, connected) VALUES (?, ?, ?, ?, 1)`,
    [genId('soc'), clientId, platform, handle]
  )
  return { ok: true }
})
