// 301 redirect www.lakara.id → lakara.id (konsolidasi SEO).
// Google sempat meng-index versi www; ini menyatukan sinyal ke domain utama.
export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host') || ''
  if (host.toLowerCase().startsWith('www.')) {
    const bare = host.slice(4)
    const url  = getRequestURL(event)
    return sendRedirect(event, `https://${bare}${url.pathname}${url.search}`, 301)
  }
})
