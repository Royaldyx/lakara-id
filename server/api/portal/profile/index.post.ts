import { queryOne, execute } from '~/server/utils/db'
import { requirePortalUser, scopedClientId, assertClientOwnership, logActivity } from '~/server/utils/portal'

// Update profil/brand klien. Client: dirinya. Admin: via client_id.
export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const b = await readBody(event)
  const cid = scopedClientId(user, (b.client_id || '').toString())
  if (!cid) throw createError({ statusCode: 400, statusMessage: 'Klien tidak ditemukan.' })
  assertClientOwnership(user, cid)

  const client = await queryOne('SELECT id FROM portal_clients WHERE id = ?', [cid])
  if (!client) throw createError({ statusCode: 404, statusMessage: 'Klien tidak ditemukan.' })

  const company = (b.company_name || '').toString().trim()
  if (!company) throw createError({ statusCode: 400, statusMessage: 'Nama perusahaan wajib diisi.' })

  await execute(
    `UPDATE portal_clients SET
       company_name = ?, brand_name = ?, pic_name = ?, email = ?, whatsapp = ?, website = ?,
       industry = ?, logo = ?, brand_description = ?, target_audience = ?, competitor = ?,
       tone_of_voice = ?, business_goals = ?
     WHERE id = ?`,
    [company, b.brand_name || null, b.pic_name || null, b.email || null, b.whatsapp || null,
     b.website || null, b.industry || null, b.logo || null, b.brand_description || null,
     b.target_audience || null, b.competitor || null, b.tone_of_voice || null, b.business_goals || null, cid]
  )

  await logActivity(event, user, 'update_profile', 'client', cid)
  return { ok: true }
})
