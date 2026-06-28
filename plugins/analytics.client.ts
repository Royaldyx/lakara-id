/**
 * Analytics plugin — load Google Analytics 4 & Meta Pixel
 * ID dikonfigurasi dari Admin Settings → data/settings.json
 * Pakai $fetch bukan useFetch (plugin tidak boleh pakai composables Vue)
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  // Silent fail — analytics tidak boleh crash seluruh app
  try {
    const settings = await $fetch<Record<string, any>>('/api/settings').catch(() => ({}))

    const gaId    = settings?.ga_id    || ''
    const pixelId = settings?.pixel_id || ''

    // ── Google Analytics 4 ──────────────────────────────────
    if (gaId) {
      const script1     = document.createElement('script')
      script1.async     = true
      script1.src       = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
      document.head.appendChild(script1)

      const script2 = document.createElement('script')
      script2.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `
      document.head.appendChild(script2)

      // Track page views saat navigasi
      nuxtApp.hook('page:finish', () => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          ;(window as any).gtag('event', 'page_view', {
            page_path: window.location.pathname,
          })
        }
      })
    }

    // ── Meta Pixel ───────────────────────────────────────────
    if (pixelId) {
      const script = document.createElement('script')
      script.textContent = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init','${pixelId}');
        fbq('track','PageView');
      `
      document.head.appendChild(script)
    }
  } catch (e) {
    // Jangan sampai analytics crash app
    if (process.dev) console.warn('[Analytics] Error:', e)
  }
})
