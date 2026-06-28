export default defineEventHandler((event) => {
  deleteCookie(event, 'lakara_member', { path: '/' })
  return { ok: true }
})
