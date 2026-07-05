// Tangkap ?shopee_import dari URL PALING AWAL (sebelum middleware/redirect apa pun),
// simpan ke sessionStorage. Bookmarklet buka /member/products/edit?shopee_import=<json>,
// tapi bootstrap auth SPA bisa mem-bounce ke dashboard & query hilang — ini nyelametin datanya.
export default defineNuxtPlugin(() => {
  try {
    const q = new URLSearchParams(window.location.search).get('shopee_import')
    if (q) sessionStorage.setItem('shopee_import', q)
  } catch { /* ignore */ }
})
