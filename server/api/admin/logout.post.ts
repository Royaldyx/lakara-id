export default defineEventHandler((event) => {
  deleteCookie(event, 'lakara_admin', { path: '/' })
  return { ok: true }
})
