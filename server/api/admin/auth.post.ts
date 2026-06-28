export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  if (body?.username === config.adminUser && body?.password === config.adminPass) {
    setCookie(event, 'lakara_admin', 'true', {
      maxAge:   60 * 60 * 8,
      path:     '/',
      sameSite: 'strict',
      httpOnly: false, // perlu false agar useCookie di client bisa baca
    })
    return { ok: true }
  }

  return { ok: false, message: 'Username atau password salah.' }
})
