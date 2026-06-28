# CLAUDE.md — Lakara.id Project Documentation

> **Last updated:** Juni 2026  
> Dokumen ini adalah referensi teknis lengkap project **lakara.id** untuk digunakan bersama Claude Code / Cowork AI assistant.

---

## 1. Overview

**lakara.id** adalah platform digital all-in-one milik **PT Lakara Solusi Kreatif**.

Fitur utama:
- **Link Bio** — halaman bio link publik di `lakara.id/{slug}` (mirip Linktree)
- **Storefront** — toko online sederhana di `lakara.id/{slug}/store`
- **Member Portal** — dashboard member untuk kelola link bio, produk, profil
- **Admin Panel** — manajemen seluruh toko, member, konten, dan upgrade tier

---

## 2. Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | **Nuxt 3.13.2** (SSR + Nitro) |
| UI | **@nuxt/ui 2.18.7** (Tailwind CSS built-in) |
| Icons | `@iconify-json/tabler` + `@nuxt/icon` |
| Database | **MySQL** via `mysql2` (pool) |
| Email | `nodemailer` (SMTP) |
| Payment | **Tripay Closed Payment API** (HMAC-SHA256) |
| ORM | Custom helpers: `query`, `queryOne`, `execute` di `server/utils/db.ts` |
| Auth | Cookie-based (`lakara_admin`, `lakara_member`) |
| Hosting | **Arenhost cPanel** — Node.js App (Passenger), Node 22.x |
| Build | **Windows only** (oxc-parser native binding tidak support Linux) |

**Dependencies (`package.json`):**
```json
{
  "dependencies": {
    "@iconify-json/tabler": "^1.2.5",
    "@nuxt/ui": "^2.18.7",
    "mysql2": "^3.22.5",
    "nodemailer": "^6.9.0",
    "nuxt": "^3.13.2",
    "seq-queue": "^0.0.5",
    "sqlstring": "^2.3.3"
  }
}
```

---

## 3. Struktur Direktori

```
lakara/
├── CLAUDE.md                    # Dokumen ini
├── package.json
├── nuxt.config.ts
├── tailwind.config.ts
├── app.config.ts
├── app.vue
├── error.vue
│
├── assets/css/main.css
├── public/
│   ├── favicon.*
│   └── stock/                   # 8 SVG wallpaper themes
│
├── layouts/
│   ├── default.vue              # Publik (header+footer)
│   ├── admin.vue                # Admin sidebar
│   └── member.vue               # Member sidebar
│
├── middleware/
│   ├── admin.ts                 # Redirect ke /admin jika belum login
│   └── member.ts                # Redirect ke /member jika belum login
│
├── plugins/
│   └── analytics.client.ts      # Google Analytics 4
│
├── composables/
│   ├── useAdmin.ts              # Auth header + logout admin
│   ├── useMember.ts             # storeData reactive member
│   ├── useImageCompress.ts      # Kompresi gambar sebelum upload
│   ├── useSeoPage.ts            # SEO meta helper
│   └── useSiteConfig.ts         # Config publik (nama, SMTP, dll)
│
├── components/
│   ├── AppHeader.vue
│   ├── AppFooter.vue
│   ├── FloatingWA.vue
│   ├── LakasaLogo.vue
│   ├── NewsletterCapture.vue
│   └── ProfilePhotoUploader.vue
│
├── pages/
│   ├── index.vue               # Landing page
│   ├── about.vue / contact.vue / pricing.vue / services.vue
│   ├── terms.vue / privacy.vue / kalkulator.vue
│   ├── portfolio.vue / portfolio/[slug].vue
│   ├── artikel/index.vue / artikel/[slug].vue
│   ├── layanan/[slug].vue
│   │
│   ├── [toko]/                  # Public store pages
│   │   ├── index.vue            # Bio link page
│   │   ├── store.vue            # Storefront/katalog
│   │   └── [produk].vue         # Detail produk
│   │
│   ├── member/                  # Member portal (ssr: false)
│   │   ├── index.vue / dashboard.vue / account.vue
│   │   ├── profile.vue / store.vue / upgrade.vue / terms.vue
│   │   ├── register.vue / forgot-password.vue / reset-password.vue
│   │   ├── links/index.vue      # Link bio editor (font, warna, dll)
│   │   ├── products/index.vue / edit.vue
│   │   └── payment/[ref].vue    # Halaman status pembayaran Tripay
│   │
│   └── admin/                   # Admin panel (ssr: false)
│       ├── index.vue            # Login admin
│       ├── dashboard.vue
│       ├── seo.vue / settings.vue / terms.vue
│       ├── stores/index.vue / edit.vue / [id]/index.vue
│       ├── stores/[id]/products/edit.vue
│       ├── members/index.vue    # Member management + tier upgrade
│       ├── upgrade-requests/index.vue
│       ├── artikel/index.vue / edit.vue
│       ├── portfolio/index.vue / edit.vue
│       ├── faq/index.vue / testimoni/index.vue
│       ├── newsletter/index.vue / uploads/index.vue
│       └── pending-members (via members/index.vue tab)
│
├── server/
│   ├── routes/sitemap.xml.ts
│   ├── utils/
│   │   ├── db.ts               # MySQL pool + query/queryOne/execute
│   │   ├── member.ts           # hashPassword, getMemberStore, parseStore
│   │   ├── data.ts             # checkAuth (admin cookie), artikel/portofolio loader
│   │   ├── email.ts            # sendMail (nodemailer)
│   │   ├── rateLimit.ts        # IP-based rate limiter
│   │   ├── tripay.ts           # Tripay API helper (HMAC, channels, fetch)
│   │   └── uploads.ts          # File upload helper
│   │
│   └── api/                    # (lihat section API Routes)
│
└── SQL files:
    ├── schema.sql               # Skema database lengkap
    ├── payment-migration.sql    # Tabel payments (jalankan setelah schema.sql)
    ├── seed-demo-stores.sql
    ├── seed-faq.sql
    ├── seed-terms.sql
    └── seed-testimonials.sql
```

---

## 4. Konfigurasi (`nuxt.config.ts`)

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ui: { global: true, icons: ['tabler'] },
  colorMode: { preference: 'light', fallback: 'light', classSuffix: '' },
  ssr: true,
  nitro: {
    preset: 'node-server',
    externals: { external: ['mysql2'] },
  },
  runtimeConfig: { /* lihat section Env Vars */ },
  routeRules: {
    '/admin/**': { ssr: false },
    '/admin':    { ssr: false },
    '/member/**': { ssr: false },
    '/member':   { ssr: false },
  },
})
```

> **⚠️ Icon bundling (wajib untuk production):**  
> Tambahkan ini ke `nuxt.config.ts` untuk menghindari error `failed to load icon` di server:
> ```typescript
> icon: {
>   serverBundle: 'local',
>   clientBundle: { scan: true },
> },
> ```

---

## 5. Environment Variables

File `.env` di root project (local) dan di `/home/lakaraid/lakara/.env` (server).  
Semua di-override via `NUXT_*` prefix — Nuxt auto-mapping ke `runtimeConfig`.

| Env Var | runtimeConfig key | Keterangan |
|---|---|---|
| `NUXT_DATA_DIR` | `dataDir` | Path penyimpanan file upload, misal `/home/lakaraid/data` |
| `NUXT_ADMIN_USER` | `adminUser` | Username login admin (default: `admin`) |
| `NUXT_ADMIN_PASS` | `adminPass` | Password login admin |
| `NUXT_SMTP_HOST` | `smtpHost` | SMTP host untuk email |
| `NUXT_SMTP_PORT` | `smtpPort` | SMTP port (default: `465`) |
| `NUXT_SMTP_USER` | `smtpUser` | SMTP username |
| `NUXT_SMTP_PASS` | `smtpPass` | SMTP password |
| `NUXT_SMTP_FROM` | `smtpFrom` | Dari: email (default: `Lakara <noreply@lakara.id>`) |
| `NUXT_APP_URL` | `appUrl` | URL publik (default: `https://lakara.id`) |
| `NUXT_DB_HOST` | `dbHost` | MySQL host (default: `localhost`) |
| `NUXT_DB_PORT` | `dbPort` | MySQL port (default: `3306`) |
| `NUXT_DB_USER` | `dbUser` | MySQL username |
| `NUXT_DB_PASS` | `dbPass` | MySQL password |
| `NUXT_DB_NAME` | `dbName` | Nama database (production: `lakaraid_lakaracreative`) |
| `NUXT_TRIPAY_API_KEY` | `tripayApiKey` | API key Tripay |
| `NUXT_TRIPAY_PRIVATE_KEY` | `tripayPrivateKey` | Private key Tripay |
| `NUXT_TRIPAY_MERCHANT_CODE` | `tripayMerchantCode` | Merchant code Tripay (contoh: `T18230`) |
| `NUXT_TRIPAY_MODE` | `tripayMode` | `sandbox` atau `production` |

**Contoh `.env` production:**
```env
NUXT_TRIPAY_API_KEY=5TU2AFe6jzbyG4zwfxBI0bAx9qcnmtFK3zOdg5c5
NUXT_TRIPAY_PRIVATE_KEY=jwpWy-BMQlY-exVDh-PRdrh-QthGY
NUXT_TRIPAY_MERCHANT_CODE=T18230
NUXT_TRIPAY_MODE=production
NUXT_DB_USER=lakaraid_user
NUXT_DB_PASS=secret
NUXT_DB_NAME=lakaraid_lakaracreative
NUXT_DATA_DIR=/home/lakaraid/data
NUXT_ADMIN_PASS=Lakara@2024
```

> **Tips server Arenhost:** Set env vars via **cPanel → Node.js App Manager → Environment Variables** agar lebih reliable daripada `.env` file dengan Passenger.

---

## 6. Database Schema

Database: `lakaraid_lakaracreative` (MySQL / MariaDB, charset `utf8mb4_unicode_ci`)

### Tabel: `stores`
Tabel utama — satu row = satu toko/member.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `VARCHAR(20)` PK | ID unik toko |
| `slug` | `VARCHAR(100)` UNIQUE | URL slug: `lakara.id/{slug}` |
| `name` | `VARCHAR(255)` | Nama toko |
| `tagline` | `VARCHAR(255)` | Tagline singkat |
| `description` | `TEXT` | Deskripsi toko |
| `logo` | `VARCHAR(500)` | URL foto profil |
| `primary_color` | `VARCHAR(7)` | Warna aksen (hex, default `#3358ff`) |
| `active` | `TINYINT(1)` | Status toko aktif/nonaktif |
| `member_active` | `TINYINT(1)` | Status akun member aktif/nonaktif |
| `member_email` | `VARCHAR(255)` UNIQUE | Email login member |
| `member_password` | `VARCHAR(64)` | Password SHA-256 + salt |
| `instagram/tiktok/whatsapp/youtube` | `VARCHAR(255)` | Sosmed toko |
| `why_buy` | `JSON` | Array alasan beli |
| `products` | `JSON` | Array produk storefront |
| `links_bio` | `JSON` | Semua data link bio (links, colors, fonts, dll) |
| `product_tier` | `VARCHAR(20)` | `free` / `pro` / `premium` |
| `tier_started_at` | `DATETIME` | Kapan tier aktif mulai |
| `tier_expires_at` | `DATETIME` | Kapan tier berakhir |
| `show_on_showcase` | `TINYINT(1)` | Tampil di showcase publik |
| `product_image_ratio` | `VARCHAR(10)` | Rasio gambar produk: `1:1` / `3:4` |
| `created_at` | `DATETIME` | Timestamp |

### Tabel: `payments`
Riwayat transaksi pembayaran (dari `payment-migration.sql`).

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `VARCHAR(50)` PK | Merchant ref (`LKR-{timestamp}-{store_id}`) |
| `tripay_ref` | `VARCHAR(100)` | Reference dari Tripay |
| `store_id` | `VARCHAR(20)` | FK ke `stores.id` |
| `tier_type` | `VARCHAR(20)` | `pro` / `premium` |
| `months` | `INT` | Durasi berlangganan |
| `amount` | `INT` | Total nominal (Rupiah) |
| `method` | `VARCHAR(50)` | Kode channel (misal `QRIS`, `BRIVA`) |
| `method_type` | `VARCHAR(20)` | `direct` / `redirect` |
| `pay_code` | `VARCHAR(100)` | Kode virtual account / nomor bayar |
| `pay_url` | `TEXT` | URL redirect (e-wallet) |
| `checkout_url` | `TEXT` | URL checkout Tripay |
| `qr_url` | `TEXT` | URL gambar QR |
| `qr_string` | `TEXT` | String data QR |
| `status` | `VARCHAR(20)` | `pending` / `paid` / `failed` / `expired` |
| `expired_at` | `DATETIME` | Batas waktu bayar (24 jam) |
| `created_at` | `DATETIME` | Timestamp |

### Tabel Lainnya

| Tabel | Fungsi |
|---|---|
| `reset_tokens` | Token reset password (expire time, store_id, email) |
| `pending_members` | Antrian pendaftaran member baru |
| `upgrade_requests` | Request upgrade manual (flow lama, sebelum Tripay) |
| `settings` | Key-value config: `pro_price`, `premium_price`, `upload_limit_free`, `upload_limit_pro` |
| `newsletter` | Subscriber email newsletter |
| `faqs` | Pertanyaan FAQ publik |
| `testimonials` | Testimoni publik |
| `link_clicks` | Analytics klik link bio per store_id + link_id |

---

## 7. Member Tier System

| Tier | Harga | Limit |
|---|---|---|
| `free` | Gratis | 5 link, 10 produk, tampilan default |
| `pro` | Rp 9.000/bln | Link tak terbatas, custom style, analytics klik, produk unlimited |
| `premium` | Rp 35.000/bln | Semua Pro + hapus branding, verified badge, animasi tombol, video/foto wallpaper |

Harga disimpan di tabel `settings` dengan key `pro_price` dan `premium_price`.

**Tier field di `stores`:**
- `product_tier` — nilai aktif saat ini
- `tier_started_at` — diset saat tier diaktifkan
- `tier_expires_at` — NULL untuk free, diisi saat pro/premium diaktifkan

**Cara aktivasi tier:**
1. **Via Tripay (self-service):** Member buka `/member/upgrade` → pilih tier + channel pembayaran → bayar → callback otomatis update DB
2. **Via Admin (manual):** Admin buka `/admin/members` → klik "Tier" di baris member → pilih tier + durasi → simpan

---

## 8. Tripay Payment Integration

### File utama: `server/utils/tripay.ts`

```typescript
getTripayConfig()          // Baca runtimeConfig, return { apiKey, privateKey, merchantCode, baseUrl, isSandbox }
TRIPAY_CHANNELS[]          // Daftar channel: QRIS, ShopeePay, DANA, BRIVA, BNIVA, MANDIRIVA, BCAVA
getAvailableChannels(amount) // Filter channels by minAmount
createTransactionSignature(merchantCode, merchantRef, amount, privateKey) // HMAC-SHA256
verifyCallbackSignature(rawBody, signature, privateKey) // Validasi webhook
tripayFetch<T>(endpoint, method, body?) // HTTP helper ke Tripay API
createTripayTransaction(payload)        // Buat transaksi, return TripayTransactionResult
```

### Base URL
- Sandbox: `https://tripay.co.id/api-sandbox`
- Production: `https://tripay.co.id/api`

Auto-switch berdasarkan `NUXT_TRIPAY_MODE=production` atau `sandbox`.

### Flow Pembayaran
```
Member pilih tier + channel
  → POST /api/member/payment/create
    → Validasi (tier, channel, pending payment)
    → createTripayTransaction() → Tripay API
    → INSERT INTO payments (status: 'pending')
    → Return { merchant_ref, pay_code, qr_url, checkout_url, ... }
  → Redirect ke /member/payment/{ref}
    → Poll GET /api/member/payment/{ref} setiap 5 detik
    → Jika paid → tampil sukses + tier diupdate

Tripay kirim webhook ke POST /api/tripay/callback
  → verifyCallbackSignature (HMAC-SHA256 dari raw body)
  → UPDATE payments SET status = ?
  → Jika paid → UPDATE stores SET product_tier, tier_started_at, tier_expires_at
```

### Channels & Fee

| Code | Nama | Min | Fee |
|---|---|---|---|
| `QRIS` | QRIS | Rp 1.000 | 0,7% + Rp 750 |
| `SHOPEEPAY` | ShopeePay | Rp 1.000 | 3% |
| `DANA` | DANA | Rp 1.000 | 3% |
| `BRIVA` | BRI Virtual Account | Rp 10.000 | Rp 4.250 |
| `BNIVA` | BNI Virtual Account | Rp 10.000 | Rp 4.250 |
| `MANDIRIVA` | Mandiri Virtual Account | Rp 10.000 | Rp 4.250 |
| `BCAVA` | BCA Virtual Account | Rp 10.000 | Rp 5.500 |

---

## 9. API Routes Reference

### Auth
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/auth` | Login admin (set cookie `lakara_admin`) |
| POST | `/api/admin/logout` | Logout admin |
| POST | `/api/member/auth` | Login member (set cookie `lakara_member`) |
| POST | `/api/member/logout` | Logout member |
| POST | `/api/member/register` | Daftar member baru (masuk ke `pending_members`) |
| POST | `/api/member/forgot-password` | Kirim email reset password |
| GET | `/api/member/validate-reset-token` | Validasi token reset |
| POST | `/api/member/reset-password` | Reset password dengan token |

### Public API
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/artikel` | Daftar artikel |
| GET | `/api/faq` | Daftar FAQ |
| GET | `/api/portfolio` | Daftar portfolio |
| POST | `/api/portfolio` | Tambah portfolio (public form) |
| GET | `/api/seo` | SEO settings |
| GET | `/api/settings` | Settings publik (harga tier, dll) |
| GET | `/api/stores` | Semua toko (untuk showcase) |
| GET | `/api/terms` | Konten halaman terms |
| GET | `/api/testimoni` | Daftar testimoni |
| POST | `/api/newsletter` | Subscribe newsletter |
| POST | `/api/public/record-click` | Catat klik link bio |
| GET | `/api/public/showcase` | Toko yang tampil di showcase |
| GET | `/api/file/[filename]` | Serve file upload |

### Member API (requires `lakara_member` cookie)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/member/store` | Data toko member |
| POST | `/api/member/store` | Update data toko |
| GET | `/api/member/links` | Data link bio |
| POST | `/api/member/links` | Simpan link bio |
| POST | `/api/member/products` | CRUD produk |
| POST | `/api/member/upload` | Upload file (gambar/video) |
| POST | `/api/member/password` | Ganti password |
| POST | `/api/member/change-slug` | Ganti URL slug toko |
| GET | `/api/member/analytics` | Analitik klik link (Pro+) |
| GET | `/api/member/upgrade-status` | Status tier + expired |
| POST | `/api/member/upgrade-request` | Request upgrade manual (flow lama) |
| POST | `/api/member/payment/create` | Buat transaksi Tripay |
| GET | `/api/member/payment/[ref]` | Cek status pembayaran |

### Tripay Webhook
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/tripay/callback` | Webhook dari Tripay, validasi HMAC, update DB |

### Admin API (requires `lakara_admin` cookie)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET/POST | `/api/admin/members` | List + manage akun member |
| POST | `/api/admin/members` action=`set_tier` | Manual upgrade tier member |
| GET/POST | `/api/admin/pending-members` | Approve/reject pendaftaran |
| GET/POST | `/api/admin/stores` | CRUD data toko |
| GET/POST | `/api/admin/upgrade-requests` | Proses request upgrade manual |
| GET/POST | `/api/admin/artikel` | CRUD artikel |
| GET/POST | `/api/admin/portfolio` | CRUD portfolio |
| GET/POST | `/api/admin/faq` | CRUD FAQ |
| GET/POST | `/api/admin/testimoni` | CRUD testimoni |
| GET/POST | `/api/admin/seo` | SEO settings |
| GET/POST | `/api/admin/settings` | Site settings (harga tier, dll) |
| GET/POST | `/api/admin/newsletter` | Kelola subscriber |
| GET/POST | `/api/admin/uploads` | File manager |
| POST | `/api/admin/upload` | Upload file dari admin |
| POST | `/api/admin/member-creds` | Update credentials member |

### `members.post.ts` — Supported Actions

| `action` | Keterangan |
|---|---|
| `create` | Buat akun member baru untuk toko yang sudah ada |
| `toggle_active` | Aktif/nonaktifkan akun member |
| `update_creds` | Ganti email/password member |
| `set_tier` | Set tier (free/pro/premium) + durasi bulan |
| `remove_access` | Hapus akses member (sentintel email agar tidak bentrok UNIQUE) |
| `delete` | Hapus toko + semua data permanen |

---

## 10. Link Bio — `links_bio` JSON Structure

Field `stores.links_bio` menyimpan semua data kustomisasi halaman bio:

```typescript
{
  title: string,           // Nama / judul tampilan
  bio: string,             // Bio singkat
  show_name: boolean,
  show_bio: boolean,
  font_family: string,     // Lihat daftar font di bawah
  
  // Background
  bg_type: 'solid' | 'gradient' | 'image' | 'video',
  bg_color: string,        // Hex
  gradient_from: string,
  gradient_to: string,
  gradient_angle: number,
  bg_image: string,        // URL (Premium)
  bg_video: string,        // URL (Premium)
  
  // Warna
  title_color: string,
  bio_color: string,
  button_color: string,
  button_text_color: string,
  accent_color: string,
  
  // Kartu link
  card_style: 'default' | 'filled' | 'outline' | 'ghost',
  card_radius: 'sm' | 'md' | 'lg' | 'full',
  button_animation: 'none' | 'pulse' | 'bounce' | 'shake' | 'glow',
  
  // Lainnya
  template: string,        // Nama template yang dipilih
  hide_branding: boolean,  // Premium
  verified: boolean,       // Premium
  show_products: boolean,
  social_style: 'outline' | 'color',
  
  // Sosial media icons
  socials: Array<{ type: string, url: string }>,
  
  // Links
  links: Array<{
    id: string,
    type: string,          // 'instagram' | 'tiktok' | ... | 'custom'
    label: string,
    url: string,
    image: string,         // Card image URL
    enabled: boolean,
    featured: boolean,     // Pro: tampil lebih besar
  }>
}
```

### Font Options (25 pilihan, via Google Fonts)
`default`, `inter`, `poppins`, `montserrat`, `raleway`, `nunito`, `quicksand`, `dmsans`, `spacegrotesk`, `josefin`, `ubuntu`, `lato`, `roboto`, `exo2`, `oswald`, `righteous`, `bebasneue`, `fredoka`, `playfair`, `merriweather`, `cinzel`, `dancingscript`, `lobster`, `pacifico`, `caveat`

---

## 11. Deployment (Arenhost cPanel)

### Setup awal
1. cPanel → **Node.js App Manager** → Create App
   - Node version: **22.x**
   - App root: `lakara/`
   - Startup file: `.output/server/index.mjs`
2. Set semua env vars di Node.js App Manager → Environment Variables
3. Database: buat via cPanel → MySQL → jalankan `schema.sql` lalu `payment-migration.sql`

### Deploy update (setiap kali ada perubahan kode)

> **⚠️ Build WAJIB dilakukan di Windows** — `oxc-parser` punya native binding yang tidak kompatibel dengan Linux.

```bash
# 1. Di Windows (local)
npm run build          # Output di .output/

# 2. Zip folder .output/
# Pastikan full ~20MB+. Kalau < 15MB kemungkinan tidak lengkap.

# 3. Upload ke cPanel File Manager
#    Path: /home/lakaraid/lakara/
#    Delete .output lama dulu, extract zip baru

# 4. cPanel → Node.js App Manager → Restart App
```

### Cek deployment berhasil
- Buka `lakara.id` — halaman harus muncul
- Buka `lakara.id/member` — redirect ke login
- Check `stderr.log` di File Manager (`/home/lakaraid/lakara/`) untuk error

### Struktur file di server
```
/home/lakaraid/lakara/
├── .output/              # Build output (dari Windows)
│   └── server/index.mjs  # Entry point Nitro
├── .env                  # Env vars (atau via cPanel Node.js App Manager)
└── node_modules/         # Dibutuhkan Passenger (tidak perlu rebuild di server)
```

---

## 12. Server Utils

### `server/utils/db.ts`
```typescript
getDb(): mysql.Pool          // Singleton MySQL pool
query<T>(sql, params)        // SELECT → T[]
queryOne<T>(sql, params)     // SELECT → T | null
execute(sql, params)         // INSERT/UPDATE/DELETE → ResultSetHeader
```

### `server/utils/member.ts`
```typescript
hashPassword(p: string)      // SHA-256 + 'lakara_salt'
parseStore(store)            // Parse JSON fields, normalize booleans
getMemberStore(event)        // Baca cookie, return store atau throw 401
safeMemberStore(store)       // Strip member_password sebelum kirim ke client
```

### `server/utils/data.ts`
```typescript
checkAuth(event): boolean    // Validasi cookie admin (lakara_admin)
```

### Auth Mechanism
- **Admin:** Cookie `lakara_admin` berisi `{user}:{timestamp}` di-hash
- **Member:** Cookie `lakara_member` berisi `store.id`
- Tidak ada JWT — session-based via cookie HTTP-only

---

## 13. Known Issues & Fixes

### 1. Error: `ERR_MODULE_NOT_FOUND: chunks/_/nitro.mjs`
**Penyebab:** Build `.output` tidak lengkap (zip terlalu kecil < 15MB)  
**Fix:** Rebuild di Windows → pastikan zip `.output` ~20MB+ → hapus `.output` lama di server → extract ulang

### 2. Error: `[POST] api-sandbox/...` padahal env sudah production
**Penyebab:** Server belum reload `.env` setelah diubah, atau masih pakai cache  
**Fix:** Set env via cPanel Node.js App Manager (bukan `.env` file) → restart app

### 3. Error: `[Icon] failed to load icon 'tabler:...'` (ratusan error)
**Penyebab:** `@nuxt/icon` fetch icon dari CDN saat runtime SSR, gagal di server  
**Fix:** Tambah ke `nuxt.config.ts`:
```typescript
icon: {
  serverBundle: 'local',
  clientBundle: { scan: true },
},
```
Lalu rebuild dan redeploy.

### 4. Error: `Duplicate entry '' for key 'uk_email'`
**File:** `server/api/admin/members.post.ts` action `remove_access`  
**Status:** ✅ Sudah diperbaiki — pakai sentinel email `removed_{id}@lakara.local` agar tidak bentrok UNIQUE KEY

### 5. Build gagal di Linux/server
**Penyebab:** `oxc-parser` (dipakai Nuxt) tidak ada native binding untuk Linux  
**Fix:** Selalu build di Windows lokal, upload hasil build

---

## 14. Scripts

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Production build → .output/
npm run start    # Jalankan production server (node .output/server/index.mjs)
npm run preview  # Preview production build lokal
npm run static   # Generate static HTML (tidak dipakai di setup ini)
```

---

## 15. Google Analytics

GA4 ID: `G-VEW7L4557B`  
Diload via `app.head.script` di `nuxt.config.ts` + `plugins/analytics.client.ts`

---

## 16. Sitemap

Auto-generate di `server/routes/sitemap.xml.ts` — termasuk semua slug toko aktif.

---

## 17. Catatan Penting untuk Claude

1. **Jangan pernah build di shell Linux** — selalu ingatkan user untuk build di Windows
2. **Saat edit API**, cek dulu apakah endpoint sudah ada di `server/api/admin/` atau `server/api/member/`
3. **Tripay callback** wajib pakai `readRawBody(event, false)` untuk validasi HMAC — jangan pakai `readBody()` karena parsing JSON mengubah raw string
4. **Kolom `links_bio`** adalah JSON besar — semua preferensi bio link tersimpan di sini dalam satu field
5. **Tier check** di halaman member selalu via `store.product_tier` + `tier_expires_at` — tidak ada middleware tier, dicek per-fitur di frontend
6. **Upload file** disimpan di `NUXT_DATA_DIR` (server) atau `dataDir` (runtimeConfig), bukan di `public/`
7. **Auth admin** pakai `checkAuth(event)` dari `server/utils/data.ts` di setiap admin endpoint
8. **Auth member** pakai `getMemberStore(event)` dari `server/utils/member.ts` — auto-throw 401 jika tidak ada cookie
9. **Auth Client Portal** pakai `getPortalUser(event)` / `requireRole(event, [...])` dari `server/utils/portal.ts` — TERPISAH dari admin/member (cookie `lakara_portal`, session DB)
10. **Reserved slug** ada di DUA file (`register.post.ts` + `change-slug.post.ts`) — keduanya HARUS sinkron. Saat ini: about, contact, pricing, portfolio, services, artikel, layanan, member, admin, kalkulator, privacy, terms, api, sitemap, favicon, robots, lakara, hapus-akun, showcase, client
11. **⚠️ `app.vue` → `SITE_PREFIXES`**: route yang TIDAK ada di daftar ini diperlakukan sebagai halaman toko publik `/[toko]` dan dirender TANPA `<NuxtLayout>` (layout via `definePageMeta` DIABAIKAN). Setiap menambah grup route top-level baru (mis. `/client`, `/showcase`), WAJIB tambahkan prefix-nya ke `SITE_PREFIXES` di `app.vue` — kalau tidak, sidebar/navbar/layout hilang.

---

## 18. Changelog — Session 3 (Juni 2026)

> Semua perubahan di bawah **BELUM di-build/deploy**. Build di Windows. Jalankan migration SQL DULU sebelum upload build.

### 18.1 Migration SQL yang WAJIB dijalankan (urut)
1. `email-verification-migration.sql` — kolom `stores.email_verified` + tabel `email_verifications`
2. `client-portal-migration.sql` — 19 tabel `portal_*` + seed paket + super admin (login: `admin@lakara.id` / `Lakara@2024`)

### 18.2 Fitur baru per area

**Analytics member (Pro/Premium)**
- `pages/member/analytics.vue` — dashboard KPI + grafik SVG (klik vs kunjungan) + top links, filter 7/30/90 hari
- `server/api/member/analytics.get.ts` — diperluas: views, CTR, growth vs periode lalu, daily series
- `server/api/public/record-view.post.ts` — catat page view (pakai `link_clicks` link_id=`__view__`)
- Page view dicatat di `pages/[toko]/index.vue` (onMounted)

**Halaman bio publik (`/[toko]`) — Linktree-style**
- Desktop: tampil sebagai mobile frame di tengah + backdrop blur + QR "Buka di HP" (api.qrserver.com)
- Mobile: tidak berubah

**Email verification (member)**
- Akun baru `email_verified=0` → login diblokir (`auth.post.ts`) sampai verifikasi
- `server/utils/verification.ts` (kirim email), endpoint `verify-email.get.ts`, `resend-verification.post.ts`
- Akun dari admin (`members.post.ts` create/update_creds), approve pending (`pending-members.post.ts`), & reset password otomatis `email_verified=1` (anti-lockout)
- UI: `register.vue`, `index.vue` (login banner), `verify-email.vue`; `useMember` expose `errorCode`

**PWA / persiapan Play Store**
- `manifest.webmanifest`, `icon-maskable.svg`, `sw.js`, `plugins/pwa.client.ts`, link di `nuxt.config.ts`
- `public/.well-known/assetlinks.json` (template TWA — isi SHA256 + package `id.lakara.app` nanti)
- `pages/hapus-akun.vue` + `server/api/public/delete-account-request.post.ts` (wajib Google Play)

**Showcase**
- `pages/showcase.vue` + `server/api/public/showcase.get.ts` (urut premium→pro→free), link di navbar

**Navigasi member**
- `layouts/member.vue` — bottom nav floating (mobile) 4 menu: Home/Link Bio/Analitik/Produk; sidebar tetap di desktop
- Util `.no-scrollbar` di `main.css`; tab di `links` dibuat scrollable (fix overflow horizontal); tombol sticky diangkat di atas bottom nav

### 18.3 CLIENT PORTAL (`/client`) — Fase 1 (Fondasi) SUDAH JADI

Modul agency terpisah penuh. Detail lengkap di **`CLIENT_PORTAL_ARCHITECTURE.md`** (analisis, 19 tabel, RBAC, roadmap 5 fase).

- **Auth/RBAC** (`server/utils/portal.ts`): cookie `lakara_portal`, session DB `portal_sessions`, role `super_admin`/`admin`/`client`. Helper: `getPortalUser`, `requirePortalUser`, `requireRole`, `requireAdmin`, `requireSuperAdmin`, `assertClientOwnership`, `scopedClientId`, `logActivity`, `genId`, `createPortalSession`, `destroyPortalSession`. Reuse `hashPassword` existing.
- **Composable** `usePortal` + **middleware** `portal` (gate login + blok client dari area admin).
- **Endpoints** (`/api/portal/`): `auth/login|logout|me`, `clients` (GET/POST), `users` (GET/POST super_admin), `packages` (GET), `dashboard` (GET, beda output client vs admin).
- **Layout** `layouts/portal.vue` (sidebar + floating bottom nav, role-aware).
- **Pages**: `/client` (redirect), `/client/login`, `/client/dashboard` (client), `/client/admin` (redirect), `/client/admin/dashboard`, `/client/admin/clients`, `/client/admin/users` (super_admin).
- **routeRules**: `/client/**` & `/client` → `ssr: false`.
- **"Client" = entitas BARU** (tabel `portal_clients`), BUKAN `stores`/member link-bio existing.

**Sisa roadmap Client Portal** (belum dibangun):
- F2: ✅ **SELESAI** (Juni 2026) — Client profile/onboarding, Brief mgmt, Content calendar, Approval + Revision (limit per paket). Detail di CLIENT_PORTAL_ARCHITECTURE.md.
  - Catatan: ditambah util `withTransaction()` di `db.ts` + `getClientRevisionLimit()` di `portal.ts`; config `icon` (serverBundle local) ditambah di `nuxt.config.ts`. Tidak ada migration baru (tabel sudah ada di client-portal-migration.sql).
- F3: ✅ **SELESAI** (Juni 2026) — Notification center, Ticket support, Asset library, Internal notes. Tanpa migration baru (tabel sudah ada).
  - **Notif**: `notify()`/`getAdminUserIds()`/`getClientUserIds()` di `portal.ts`; endpoint `notifications` (GET) + `notifications/read` (POST); bell+badge di `layouts/portal.vue` (polling 30dtk, `useState('portalUnread')`); page `client/notifications.vue`.
  - **Tiket**: `tickets` (GET/POST), `tickets/[id]` (GET), `tickets/[id]/reply` (POST), `tickets/[id]/status` (POST admin). Pages `client/tickets/{index,[id]}`, `client/admin/tickets/index`. `tickets/[id]` dipakai client+admin. Reply→notif lawan; status admin-only. Status auto: client balas→in_progress, admin balas→waiting_client.
  - **Asset**: `assets` (GET list + POST upload multipart, cap 20MB), `assets/[id]` (DELETE + unlink file), `folders` (POST). Page `client/assets.vue`. Simpan ke `NUXT_DATA_DIR/uploads`, serve `/api/file/[name]`.
  - **Notes internal**: `notes` (GET/POST admin-only), `notes/[id]` (DELETE). Komponen `components/PortalNotes.vue` (render hanya admin, entity_type+entity_id) — dipakai di `tickets/[id]`. JANGAN expose ke client.
  - Label tiket bersama: `composables/portalLabels.ts`. Nav `Asset`+`Tiket` ditambah di `layouts/portal.vue`.
- F4: ✅ **SELESAI** (Juni 2026) — Billing/Invoice + Reporting. Tanpa migration baru.
  - **Invoice**: `invoices` (GET scoped/admin-all + filter, POST admin create→notif klien), `invoices/[id]` (GET ownership), `invoices/[id]/status` (POST admin: paid set paid_at). Pages `client/invoices/{index,[id]}`, `client/invoices/[id]/print` (printable), `client/admin/invoices/index` (list+create item-based). PDF = **print-to-PDF** (halaman `/print` auto `window.print()`), tanpa lib server.
  - **Report**: `reports` (GET/POST admin), `reports/[id]` (GET ownership). Pages `client/reports/{index,[id]}`, `reports/[id]/print`, `client/admin/reports/index` (KPI + summary/insight/recommendation).
  - No. invoice `INV-YYYYMMDD-XXXX`. Item-based amount dihitung server.
- F5: ✅ **SELESAI** (Juni 2026) — Chat (polling), Analytics sosmed (manual), Knowledge base. Tanpa migration baru.
  - **Chat**: `chat` (GET messages scoped + auto mark-read pihak lawan, POST send), `chat/threads` (GET admin, subquery bukan HAVING). Pages `client/chat` (poll 5dtk), `client/admin/chat` (2-pane thread list + percakapan).
  - **Analytics (manual)**: `analytics` (GET metrics+accounts, filter days), `analytics/metric` (POST admin input snapshot), `analytics/account` (POST tambah akun). Pages `client/analytics` (KPI+riwayat+filter 7/30/90), `client/admin/analytics` (form input snapshot per klien). Integrasi API IG/FB/TikTok = fase lanjut; sekarang manual.
  - **Knowledge base**: `kb` (GET published utk client/all utk admin, POST admin upsert), `kb/[id]` (DELETE admin). Page `client/knowledge-base` (accordion FAQ/Tutorial/Panduan + manage inline utk admin).
  - Label invoice di `composables/portalLabels.ts`. Nav `client` & `admin` di `layouts/portal.vue` sudah lengkap utk semua modul F1–F5.

**Status: Client Portal F1–F5 SELESAI.** Tidak ada migration baru sejak `client-portal-migration.sql`. Build di Windows, jalankan migration (email-verification + client-portal) sebelum deploy.

### 18.4 F6 — Team & Freelancer (F6.1 Core SELESAI, Juni 2026)

Modul tim internal & freelancer. Arsitektur lengkap di **`CLIENT_PORTAL_F6_TEAM.md`**. **Assignment per-tugas** (bukan per-klien) → privasi otomatis.

- **Migration baru WAJIB**: `client-portal-f6-migration.sql` (5 tabel: `portal_tasks`, `portal_task_messages`, `portal_daily_reports`, `portal_contracts`, `portal_payouts`). Additive, tidak ubah tabel existing.
- **Role baru**: `staff` & `freelancer` di `portal_users.role` (tanpa ubah skema). `usePortal` expose `isTeam`; `homePath` team → `/client/tasks`. `middleware/portal.ts` route 5 role (team hanya boleh area `/client/tasks|daily-report|my-contract|my-payouts` + `/client/notifications`).
- **Endpoint** (`/api/portal/`): `tasks` (GET scoped assignee / admin-all, POST admin create|update|set_status|delete), `tasks/[id]` (GET, sembunyikan client_id dari team), `tasks/[id]/submit` (assignee multipart file/link → status submitted + notif admin), `tasks/[id]/message` (diskusi 2 arah), `team` (GET/POST admin kelola staff/freelancer).
- **Pages**: `client/tasks` (Tugas Saya), `client/tasks/[id]` (detail + submit + diskusi, dipakai team & admin), `client/admin/tasks` (assign/kelola), `client/admin/team` (kelola anggota). Nav: team→teamNav, admin→ +Tugas +Tim.
- **Label** task di `composables/portalLabels.ts` (`taskType`, `taskStatus`).
- **Privasi**: task team scope `WHERE assignee_id = user.id`; detail strip `client_id/content_id`. Freelancer tak lihat tugas/fee orang lain.

**F6.2 Daily Report — ✅ SELESAI** (Juni 2026). Endpoint `daily-reports` (GET self team / admin-all + filter ?user_id&date, POST upsert per user+tanggal, hanya staff/freelancer). Pages: `client/daily-report` (form + riwayat), `client/admin/daily-reports` (rekap + filter tanggal).

**F6.3 Kontrak/MOU + Payout — ✅ SELESAI** (Juni 2026).
- **Kontrak**: `contracts` (GET self/admin-all, POST admin multipart upload MOU), `contracts/[id]` (DELETE admin). Pages: `client/my-contract` (team), `client/admin/contracts` (admin kelola).
- **Payout**: `payouts` (GET self/admin-all+filter, POST admin create→notif), `payouts/suggest` (GET admin: auto-sum fee tugas `status='done'` per anggota+periode), `payouts/[id]/status` (POST admin mark paid→notif). Pages: `client/my-payouts` (team, ringkasan paid/pending), `client/admin/payouts` (admin create + tombol "Hitung dari tugas selesai" + tandai dibayar).
- Nav: teamNav (Tugas/Lapor/Kontrak/Bayar/Notif), adminNav (+Daily Report/Kontrak/Payout). Rate label di page.

**F6.4 Absensi Manual — ✅ SELESAI** (Juni 2026).
- **Migration baru WAJIB**: `client-portal-attendance-migration.sql` (1 tabel `portal_attendance`: user_id, date, status[hadir|izin|sakit|alpha|libur], note, created_by; UNIQUE user+date). Additive.
- **Endpoint** `/api/portal/attendance`: GET (team→absensi sendiri; admin→wajib `?user_id`, opsional `?from&to`), POST admin-only (upsert per user+date; `status:''`/`'clear'`→DELETE; validasi target staff/freelancer).
- **Page admin** `client/admin/attendance` — pilih anggota + nav bulan + kalender klik-tanggal → modal set status (hadir/izin/sakit/alpha/libur) + catatan. Stats hadir/izin+sakit/alpha/kehadiran%. Badge "LAPOR" kalau ada daily report tapi belum di-set status. Nav admin: "Absensi Tim".
- **Kalender team** (`my-calendar.vue`) tab Absensi sekarang baca `/api/portal/attendance` (self) → status admin (izin/alpha/sakit/libur) PRIORITAS atas "hadir karena ada laporan". Legend + stats diupdate (libur tak dihitung hari kerja).
- Privasi: GET scope per role; client (non-team) ditolak 403. Hadir efektif = status `hadir` ATAU ada daily report tanpa status override.

**Status: Client Portal F1–F6 SELESAI penuh.** Migration yang harus dijalankan (urut): `email-verification` → `client-portal` → `client-portal-f6` → `client-portal-attendance`. Tidak ada migration baru selain keempatnya.

**Email notifikasi (Juni 2026):** `notify()` di `server/utils/portal.ts` sekarang OTOMATIS kirim email (via `sendEmail`/nodemailer) ke tiap penerima — selain insert in-app. Fire-and-forget (tidak blok request). Semua call site `notify()` (task assign/submit/approve, ticket, invoice, report, contract, payout) langsung kirim email tanpa perubahan kode. Butuh SMTP env (`NUXT_SMTP_*`) terisi. **`NUXT_SMTP_FROM` wajib format `Nama <email@domain>`** (bukan cuma nama). Tanpa migration.

**Tambahan fitur (Juni 2026, tanpa migration):**
- **Mini-dashboard team** di `client/tasks` — 3 kartu (tugas aktif, deadline terdekat, earning bln ini). Dihitung client-side dari list tugas; `tasks/index.get.ts` (team) kini SELECT `updated_at` juga (earning = sum fee tugas `done` di bulan berjalan).
- **Kalender deadline admin** — `client/admin/deadlines` (grid bulan custom tanpa lib, ambil dari `/api/portal/tasks`). Nav admin: "Kalender Deadline".
- **Recurring invoice** — `invoices/generate-recurring` (POST admin): loop langganan aktif → buat invoice bulanan (idempotent: skip kalau `notes LIKE 'Langganan bulanan%'` sudah ada bulan ini; per-sub try/catch). Tombol "Generate Bulanan" di `client/admin/invoices`. Bisa di-trigger cron cPanel tiap awal bulan.
- **Showcase toggle di admin** — tombol "Tampil di Showcase" per toko di `pages/admin/stores/index.vue` → endpoint baru `server/api/admin/stores/showcase.post.ts` (UPDATE `show_on_showcase`, non-destruktif). **PENTING FIX**: `admin/stores.post.ts` (bulk save destruktif DELETE+INSERT) sebelumnya MENGHAPUS `show_on_showcase`, `product_image_ratio`, dan `email_verified` (yang terakhir bisa nge-lock member!). Sekarang ketiga kolom itu sudah disertakan di INSERT bulk.
- **Redesign kartu showcase** (`pages/showcase.vue`, CSS/markup-only, tanpa migration) — avatar 20×20 ring putih+shadow, cover gradient + glow accent (blur circles), tier badge premium=crown/pro=bolt, tagline `line-clamp-2` tinggi konsisten, social icons jadi pill yang berubah warna brand saat hover (IG pink, YT merah, WA hijau, TikTok hitam), CTA "Lihat →" slide-in saat hover, `rounded-3xl` + hover lift.
- **Onboarding checklist member** (`pages/member/dashboard.vue`, client-side murni, tanpa endpoint/migration) — computed `onboarding` baca `storeData` (logo, tagline, sosmed, links_bio.links, products) → 5 langkah + progress bar warna `primary_color`. Tiap langkah belum selesai = `NuxtLink` ke halaman terkait (`/member/store`, `/member/links`, `/member/products/edit`); pakai `<component :is>` (div kalau done, NuxtLink kalau belum). Auto-hide saat 5/5 → ganti banner sukses (dismissable `showDone`).
- **Fix showcase avatar ketiban banner** (`pages/showcase.vue`) — cover `position:relative` ke-paint di atas avatar `static`. Fix: tambah `relative z-10` di body card biar avatar naik ke atas cover.
- **Template link bio + font** (`pages/member/links/index.vue`) — sekarang 12 preset (tambah `elegant`, `candy`), tiap template bawa `font_family`. `applyTemplate()` set font utk Pro+. Preview kartu template tampilkan "Aa" pakai font preset. **PENTING FIX**: `links.post.ts` `VALID_FONTS` sebelumnya cuma 13 dari 25 font → font seperti raleway/dmsans/josefin/dll di-reset ke default saat save. Sekarang `VALID_FONTS` lengkap 25 (match `fontOptions`), `VALID_TEMPLATES` +elegant +candy.
- **OG image dinamis per toko** (tanpa migration, tanpa lib server) — server cPanel tak ada sharp/canvas, jadi kartu OG 1200×630 di-generate di BROWSER via `<canvas>` saat member klik Simpan di `/member/links` (`generateOgImage()`: bg solid/gradient brand + avatar bulat dari logo + nama + tagline + `lakara.id/slug`), export **JPEG q0.85** (kecil, aman utk limit free 512KB), upload via `/api/member/upload`, URL disimpan di `links_bio.og_image` + `og_sig` (tanda tangan visual; regenerate hanya kalau berubah). `links.post.ts` persist `og_image` (hanya path `/api/file/`) + `og_sig`. Halaman publik `[toko]/index.vue`: `ogImage` utamakan `bio.og_image` (fallback logo), tambah `og:image:width/height` 1200×630 + `twitter:card=summary_large_image` saat kartu generate ada. `collectUploadFiles` scan `links_bio` rekursif → og lama auto-orphan-cleanup tiap regenerate. Logo eksternal non-CORS → canvas taint → `generateOgImage` return null (graceful fallback ke logo). Tab Tampilan punya kartu "Preview Saat Dibagikan" (preview `og_image` rasio 1200/630) + tombol `regenerateOg()` (paksa buat ulang + persist langsung) — buat member lama yang belum pernah save ulang.

- **Fix SEO global ke-override `<Title>` hardcoded** — halaman `index/about/services/pricing/contact` punya `<Head><Title>…</Title></Head>` statik yang MENANG atas `useSeoPage(pageKey)` (yang baca `/api/seo` admin). Akibatnya judul di Google (mis. "Lakara — Innovating Creativity with Technology") tak bisa diubah dari SEO Settings. Fix: hapus `<Title>` hardcoded di 5 halaman itu → judul+meta kini 100% dari `useSeoPage`. Halaman dinamis (`[toko]`, `artikel/[slug]`, `portfolio/[slug]`, `layanan/[slug]`) tetap pakai `<Title>` dari kontennya (memang seharusnya). Catatan: deskripsi di hasil Google kadang di-generate Google dari isi halaman, bukan dari meta — setelah ubah SEO, minta re-index via Google Search Console (butuh hari/minggu utk refresh).

**Growth & Ops batch (Juni 2026):**
- **Annual billing** (tanpa migration) — `/member/upgrade` punya pilihan durasi 1 / 12 bulan. 12 bln = bayar 10 dapat 12 (hemat 2 bln). `payment/create.post.ts`: `billedMonths = months===12 ? 10 : months`, `amount = unitPrice*billedMonths`, tapi kolom `payments.months` tetap 12 (callback pakai itu utk expiry). order_items quantity = billedMonths. UI: `selectedMonths`, `totalPrice`, `durationOptions`.
- **Auto-downgrade tier expired** (tanpa migration) — endpoint `GET /api/cron/expire-tiers?key=SECRET` (guard `cfg.cronSecret`→`NUXT_CRON_SECRET`, fallback `adminPass`). UPDATE stores set free + tier_expires_at NULL utk yg lewat. `cronSecret` ditambah di `nuxt.config.ts` runtimeConfig. Pasang cron cPanel harian.
- **Backup DB** — `scripts/backup-db.sh` (mysqldump+gzip+retention 14 hari, simpan di luar public_html). Instruksi cron cPanel ada di komentar file.
- **Referral system** — **MIGRATION WAJIB**: `referral-migration.sql` (ALTER stores +`referred_by` +`referral_rewarded`). Kode referral = slug toko. Link: `lakara.id/member/register?ref={slug}`. `register.post.ts` capture `ref` (resolve slug→id, abaikan diri sendiri/invalid) → set `referred_by`. `tripay/callback.post.ts`: saat referee bayar PERTAMA (referral_rewarded=0), +1 bln ke referee (dari expiry baru) & +1 bln Pro ke referrer (tak nurunin premium), set rewarded=1. UI: banner di `register.vue` (baca `?ref`), kartu referral + link + stats di `member/dashboard.vue` (endpoint `GET /api/member/referral`). **PENTING**: `admin/stores.post.ts` bulk-INSERT ditambah `referred_by` + `referral_rewarded` biar bulk-save admin tak menghapusnya.

**Konvensi penting Client Portal untuk fase berikutnya:**
- SEMUA query data klien WAJIB scope `WHERE client_id = ?` dari session (pakai `scopedClientId`/`assertClientOwnership`), JANGAN ambil client_id dari body mentah (anti-IDOR).
- Hindari `GROUP BY` dengan kolom non-agregat (MySQL ONLY_FULL_GROUP_BY) — pakai subquery (lihat `clients/index.get.ts`).
- Internal notes (`portal_notes`) JANGAN pernah dikirim ke role client.
- ID pakai `genId('prefix')` (mis. `cl_`, `usr_`, `sub_`).
