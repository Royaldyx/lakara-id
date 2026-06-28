import { execute } from '~/server/utils/db'
import { requirePortalUser, scopedClientId, genId } from '~/server/utils/portal'

export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const b = await readBody(event)
  const name = (b.name || '').toString().trim().slice(0, 120)
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Nama folder wajib.' })

  const clientId = scopedClientId(user, b.client_id)
  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'client_id wajib.' })

  const id = genId('fld')
  await execute('INSERT INTO portal_folders (id, client_id, name) VALUES (?, ?, ?)', [id, clientId, name])
  return { ok: true, id }
})
