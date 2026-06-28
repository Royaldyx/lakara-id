import { queryOne } from '~/server/utils/db'
import { requirePortalUser, scopedClientId, assertClientOwnership } from '~/server/utils/portal'

// Ambil profil/brand klien. Client: dirinya. Admin: ?client_id wajib.
export default defineEventHandler(async (event) => {
  const user = await requirePortalUser(event)
  const q = getQuery(event)
  const cid = scopedClientId(user, (q.client_id || '').toString())
  if (!cid) throw createError({ statusCode: 400, statusMessage: 'Klien tidak ditemukan.' })
  assertClientOwnership(user, cid)

  const client = await queryOne<any>(
    `SELECT id, company_name, brand_name, pic_name, email, whatsapp, website, industry, logo,
            brand_description, target_audience, competitor, tone_of_voice, business_goals, status
     FROM portal_clients WHERE id = ?`, [cid]
  )
  if (!client) throw createError({ statusCode: 404, statusMessage: 'Klien tidak ditemukan.' })

  // Hitung kelengkapan onboarding (field brand utama terisi)
  const fields = [client.brand_name, client.industry, client.brand_description, client.target_audience, client.tone_of_voice, client.business_goals]
  const filled = fields.filter((v) => v && v.toString().trim()).length
  const complete = filled === fields.length

  return { ok: true, data: client, completeness: { filled, total: fields.length, complete } }
})
