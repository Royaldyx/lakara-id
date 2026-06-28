import { getMemberStore, safeMemberStore } from '~/server/utils/member'
import { queryOne, execute } from '~/server/utils/db'
import { slugify } from '~/server/utils/data'

const RESERVED_SLUGS = [
  'about', 'contact', 'pricing', 'portfolio', 'services', 'artikel',
  'layanan', 'member', 'admin', 'kalkulator', 'privacy', 'terms',
  'api', 'sitemap', 'favicon', 'robots', 'lakara', 'hapus-akun', 'showcase', 'client',
]

export default defineEventHandler(async (event) => {
  const store     = await getMemberStore(event)
  const { slug: rawSlug } = await readBody(event)

  if (!rawSlug || typeof rawSlug !== 'string')
    throw createError({ statusCode: 400, statusMessage: 'URL toko wajib diisi.' })

  const slug = slugify(rawSlug)

  if (!slug)
    throw createError({ statusCode: 400, statusMessage: 'URL tidak valid. Gunakan huruf, angka, atau tanda hubung.' })
  if (slug === store.slug)
    throw createError({ statusCode: 400, statusMessage: 'URL baru sama dengan yang sekarang.' })
  if (RESERVED_SLUGS.includes(slug))
    throw createError({ statusCode: 400, statusMessage: `URL "${slug}" tidak bisa digunakan. Pilih yang lain.` })

  const taken = await queryOne('SELECT id FROM stores WHERE slug = ? AND id != ?', [slug, store.id])
  if (taken)
    throw createError({ statusCode: 400, statusMessage: `URL "/${slug}" sudah dipakai. Pilih yang lain.` })

  await execute('UPDATE stores SET slug = ? WHERE id = ?', [slug, store.id])

  return { ok: true, data: safeMemberStore({ ...store, slug }) }
})
