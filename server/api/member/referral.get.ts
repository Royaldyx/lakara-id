import { getMemberStore } from '~/server/utils/member'
import { queryOne } from '~/server/utils/db'

// Statistik referral member: jumlah undangan & yang sudah upgrade (rewarded)
export default defineEventHandler(async (event) => {
  const store = await getMemberStore(event)
  const row = await queryOne<any>(
    `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN referral_rewarded = 1 THEN 1 ELSE 0 END) AS rewarded
     FROM stores WHERE referred_by = ?`,
    [store.id]
  )
  return {
    ok: true,
    code: store.slug,
    total: Number(row?.total || 0),
    rewarded: Number(row?.rewarded || 0),
  }
})
