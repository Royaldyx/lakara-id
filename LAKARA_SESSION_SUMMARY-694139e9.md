# CLAUDE.md — Lakara.id Project Documentation

> **Last updated:** Juni 2026 (updated session 2)  
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
| `status` | `VARCHAR(20)` | `pending` / `paid` / `failed` / `expired` / `cancelled` |
| `expired_at` | `DATETIME` | Batas waktu bayar (24 jam) |
| `created_at` | `DATETIME` | Timestamp |
| `paid_at` | `DATETIME` | Waktu pembayaran berhasil (diset di callback) |
| `updated_at` | `DATETIME` | Waktu update terakhir |

> **Catatan:** Kolom `paid_at` dan `updated_at` ditambahkan via migration manual. Status `cancelled` dipakai saat member membatalkan pending payment dari UI.
>
> **Khusus upgrade via Admin:** `id` = `ADM-{timestamp}-{store_id_6char}`, `method` = `'ADMIN'`, `amount` = `0`, `status` = `'paid'`, `tripay_ref` = NULL. Ini sebagai audit log saja, bukan transaksi Tripay.

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

> **Audit log admin:** Saat admin melakukan `set_tier` via action `set_tier` di `members.post.ts`, sistem otomatis menyisipkan record ke tabel `payments` dengan `method='ADMIN'`, `amount=0`, `status='paid'`. Ini agar history upgrade tampil di Upgrade History admin panel. Dibungkus `try/catch` sehingga `set_tier` tetap berhasil walau INSERT gagal.

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
    → Jika paid → trigger celebration modal (confetti popup) + refresh tier di sidebar
    → Member bisa klik "Batalkan & Pilih Metode Lain"
        → POST /api/member/payment/cancel → status='cancelled'
        → Redirect ke /member/upgrade

Tripay kirim webhook ke POST /api/tripay/callback
  → verifyCallbackSignature (HMAC-SHA256 dari raw body)
  → Jika payment.status sudah 'paid' → skip (idempotency)
  → UPDATE payments SET status = ?, paid_at = NOW()
  → Cek double-payment guard: jika store punya payment lain yang paid < 60 detik lalu → skip tier upgrade
  → Jika paid → UPDATE stores SET product_tier, tier_started_at, tier_expires_at
```

### Double-Payment Guard (60 detik)
Di `server/api/tripay/callback.post.ts` — setelah UPDATE status ke 'paid', sebelum upgrade tier:
```typescript
const recentOtherPaid = await queryOne(
  `SELECT id FROM payments WHERE store_id = ? AND status = 'paid'
   AND paid_at > DATE_SUB(NOW(), INTERVAL 60 SECOND) AND id != ?`,
  [payment.store_id, merchant_ref]
)
if (recentOtherPaid) {
  console.warn(`Double-payment guard: melewati tier upgrade untuk ${merchant_ref}`)
  return { success: true }
}
```
Ini melindungi edge case di mana member cancel payment A, buat payment B, tapi membayar A dari tab lama.

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
| GET | `/api/member/payment/[ref]` | Cek status pembayaran (polling setiap 5 detik) |
| POST | `/api/member/payment/cancel` | Batalkan pending payment milik member ini |
| GET | `/api/member/payment/pending` | Cek apakah ada pending payment aktif (belum expired) |
| GET | `/api/member/payments` | Riwayat 20 payment terakhir member (semua status) |

### Tripay Webhook
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/tripay/callback` | Webhook dari Tripay, validasi HMAC, update DB (ada 60s dedup guard) |

### Admin API (requires `lakara_admin` cookie)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET/POST | `/api/admin/members` | List + manage akun member |
| POST | `/api/admin/members` action=`set_tier` | Manual upgrade tier member (+ catat di payments) |
| GET/POST | `/api/admin/pending-members` | Approve/reject pendaftaran |
| GET/POST | `/api/admin/stores` | CRUD data toko |
| GET/POST | `/api/admin/upgrade-requests` | Proses request upgrade manual (flow lama, masih ada) |
| GET | `/api/admin/upgrade-history` | **BARU** — Riwayat semua upgrade (Tripay + Admin + legacy manual), gabungan `payments` + `upgrade_requests` |
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

### `upgrade-history.get.ts` — Response shape
```typescript
{
  ok: true,
  data: Array<{
    id: string,             // 'LKR-...' (Tripay), 'ADM-...' (Admin), 'REQ-N' (legacy)
    store_id: string,
    tier_type: 'pro' | 'premium',
    months: number,
    amount: number,         // 0 untuk ADMIN & MANUAL
    method: string,         // 'QRIS' | 'BRIVA' | ... | 'ADMIN' | 'MANUAL'
    status: string,         // 'paid' | 'approved'
    checkout_url: string | null,
    pay_code: string | null,
    qr_url: string | null,
    paid_at: string,
    created_at: string,
    store_name: string,
    store_slug: string,
    source: 'payment' | 'request'
  }>,
  stats: {
    total: number,
    thisMonth: number,      // upgrade bulan ini
    proCount: number,
    premiumCount: number,
    totalRevenue: number    // hanya dari Tripay (exclude ADMIN/MANUAL)
  }
}
```

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
9. **Payment cancel** hanya boleh untuk payment dengan `status='pending'` milik store yang login — cek store_id match sebelum update
10. **Tabel payments** punya kolom `paid_at` dan `updated_at` — selalu include di INSERT payment baru jika perlu
11. **Admin sidebar** — URL upgrade history tetap `/admin/upgrade-requests` (tidak diubah agar tidak perlu update semua referensi), hanya label-nya yang berganti jadi "Upgrade History"
12. **Halaman payment `[ref].vue`** — ada `celebrationFired` ref untuk prevent double-trigger. Celebration modal muncul sekali saat status berubah ke `paid`, lalu memanggil `fetchStore()` untuk refresh tier badge di sidebar
13. **Halaman upgrade.vue** — cek `GET /api/member/payment/pending` saat mount; jika ada, tampilkan banner amber + blokir pembuatan payment baru

---

## 18. Changelog

### Session 2 (Juni 2026)

**File baru ditambahkan:**
- `server/api/member/payment/cancel.post.ts` — batalkan pending payment
- `server/api/member/payment/pending.get.ts` — cek ada/tidaknya pending payment aktif
- `server/api/member/payments.get.ts` — riwayat 20 payment terakhir member
- `server/api/admin/upgrade-history.get.ts` — riwayat semua upgrade gabungan

**File dimodifikasi:**
- `server/api/tripay/callback.post.ts` — tambah 60s double-payment guard, update `paid_at` saat paid
- `server/api/admin/members.post.ts` — action `set_tier` kini menyisipkan audit log ke tabel `payments`
- `pages/member/payment/[ref].vue` — tambah celebration modal + confetti CSS, flow cancel payment
- `pages/member/upgrade.vue` — tambah pending banner, "Batalkan & Pilih Ulang", riwayat payment di bawah tier cards
- `pages/admin/upgrade-requests/index.vue` — UI total rewrite jadi "Upgrade History" (stats, filter, detail modal)
- `layouts/admin.vue` — sidebar label "Upgrade Requests" → "Upgrade History", hapus badge count merah

**Perubahan skema DB:**
- Tabel `payments`: kolom `paid_at` DATETIME, `updated_at` DATETIME (manual migration)
- Status `cancelled` ditambahkan sebagai nilai valid di `payments.status`
