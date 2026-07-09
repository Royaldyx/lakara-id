export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  css: ['~/assets/css/main.css'],

  ui: {
    global: true,
    icons: ['tabler'],
  },

  // WAJIB produksi: bundle icon lokal supaya tidak fetch CDN saat runtime SSR.
  // `icons` = daftar icon picker link bio (dipilih dinamis → wajib di-bundle eksplisit
  // biar tidak fetch runtime & tetap muncul offline).
  icon: {
    serverBundle: 'local',
    clientBundle: {
      scan: true,
      icons: [
        'tabler:brand-instagram', 'tabler:brand-tiktok', 'tabler:brand-youtube',
        'tabler:brand-facebook', 'tabler:brand-x', 'tabler:brand-whatsapp',
        'tabler:brand-telegram', 'tabler:brand-threads', 'tabler:brand-discord',
        'tabler:brand-twitch', 'tabler:brand-spotify', 'tabler:brand-github',
        'tabler:brand-linkedin', 'tabler:brand-pinterest', 'tabler:brand-snapchat',
        'tabler:brand-line', 'tabler:brand-google', 'tabler:brand-apple',
        'tabler:brand-shopee', 'tabler:brand-tidal', 'tabler:brand-soundcloud',
        'tabler:link', 'tabler:world', 'tabler:mail', 'tabler:phone',
        'tabler:map-pin', 'tabler:shopping-cart', 'tabler:shopping-bag',
        'tabler:star', 'tabler:heart', 'tabler:gift', 'tabler:coffee',
        'tabler:music', 'tabler:video', 'tabler:camera', 'tabler:wallet',
        'tabler:calendar', 'tabler:download', 'tabler:book', 'tabler:ticket',
        'tabler:bolt', 'tabler:flame', 'tabler:crown', 'tabler:rocket',
      ],
    },
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
  },

  // Node.js server mode — untuk Arenhost Node.js hosting
  ssr: true,
  nitro: {
    preset: 'node-server',
    externals: {
      external: ['mysql2'],
    },
  },

  // Semua nilai ini di-override via env var NUXT_* di server (Arenhost Node.js env variables)
  runtimeConfig: {
    dataDir:   '',               // NUXT_DATA_DIR=/home/lakaraid/data (untuk file upload)
    adminUser: 'admin',          // NUXT_ADMIN_USER
    adminPass: 'Lakara@2024',    // NUXT_ADMIN_PASS
    cronSecret: '',              // NUXT_CRON_SECRET — token utk endpoint /api/cron/*
    smtpHost:  '',               // NUXT_SMTP_HOST
    smtpPort:  '465',            // NUXT_SMTP_PORT
    smtpUser:  '',               // NUXT_SMTP_USER
    smtpPass:  '',               // NUXT_SMTP_PASS
    smtpFrom:  'Lakara <noreply@lakara.id>', // NUXT_SMTP_FROM
    appUrl:    'https://lakara.id',          // NUXT_APP_URL
    // MySQL
    dbHost:    'localhost',      // NUXT_DB_HOST
    dbPort:    '3306',           // NUXT_DB_PORT
    dbUser:    '',               // NUXT_DB_USER
    dbPass:    '',               // NUXT_DB_PASS
    dbName:    '',               // NUXT_DB_NAME
    // Tripay Payment Gateway
    tripayApiKey:       '',      // NUXT_TRIPAY_API_KEY
    tripayPrivateKey:   '',      // NUXT_TRIPAY_PRIVATE_KEY
    tripayMerchantCode: '',      // NUXT_TRIPAY_MERCHANT_CODE
    tripayMode:         'sandbox', // NUXT_TRIPAY_MODE — 'sandbox' | 'production'
  },

  routeRules: {
    '/admin/**':  { ssr: false },
    '/admin':     { ssr: false },
    '/member/**': { ssr: false },
    '/member':    { ssr: false },
    '/client/**': { ssr: false },
    '/client':    { ssr: false },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      title: 'Lakara Solusi Kreatif',
      meta: [
        { name: 'description', content: 'PT Lakara Solusi Kreatif — Mitra digital terpercaya untuk website development, mobile app, talent esports, dan social media growth.' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:site_name', content: 'Lakara Solusi Kreatif' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@lakara_id' },
        // PWA / installable
        { name: 'theme-color', content: '#3358ff' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Lakara' },
      ],
      script: [
        { src: 'https://www.googletagmanager.com/gtag/js?id=G-VEW7L4557B', async: true },
        { innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-VEW7L4557B');` },
      ],
      link: [
        { rel: 'icon',             type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon',             type: 'image/x-icon',  href: '/favicon.ico' },
        { rel: 'icon',             type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'icon',             type: 'image/png', sizes: '16x16', href: '/favicon-16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180',       href: '/apple-touch-icon.png' },
        { rel: 'manifest',         href: '/manifest.webmanifest' },
      ],
    },
  },

  devtools: { enabled: true },
})
