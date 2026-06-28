import { getMemberStore } from '~/server/utils/member'
import { execute } from '~/server/utils/db'
import { deleteOrphanUploads } from '~/server/utils/uploads'

const FREE_PRODUCT_LIMIT = 10

export default defineEventHandler(async (event) => {
  const store    = await getMemberStore(event)
  const { products } = await readBody(event)

  if (!Array.isArray(products))
    throw createError({ statusCode: 400, statusMessage: 'Data produk tidak valid.' })

  const existingCount = (store.products || []).length
  const isPro         = store.product_tier === 'pro'

  if (!isPro && products.length > existingCount && products.length > FREE_PRODUCT_LIMIT) {
    throw createError({
      statusCode: 403,
      statusMessage: `Paket Free hanya bisa menyimpan ${FREE_PRODUCT_LIMIT} produk. Upgrade ke Pro untuk produk unlimited.`,
    })
  }

  await execute('UPDATE stores SET products = ? WHERE id = ?', [JSON.stringify(products), store.id])

  await deleteOrphanUploads(store, { ...store, products })

  return { ok: true }
})
