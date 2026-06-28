export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  // Area privat / non-publik tidak perlu di-index
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /member
Disallow: /client
Disallow: /api/

Sitemap: https://lakara.id/sitemap.xml
`
})
