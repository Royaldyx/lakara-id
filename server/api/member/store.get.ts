import { getMemberStore, safeMemberStore } from '~/server/utils/member'

export default defineEventHandler(async (event) => {
  const store = await getMemberStore(event)
  return { ok: true, data: safeMemberStore(store) }
})
