# Lakara — Session Summary (Master)

> Paste isi file ini di awal sesi baru supaya Claude langsung paham konteks.
> Terakhir diupdate: Juni 2026 — sesi terbaru: link-bio Fase A (font/hide-show/social row), image cleanup (delete-on-replace + tombol admin), fitur Terms of Service, seed data, setup laptop baru.

---

## 0. SETUP DI LAPTOP BARU (dari nol)

Urutan ini bikin project jalan di laptop kosong sampai siap `npm run build`.

### 0.1 Software wajib di-install dulu

| Tool | Versi | Catatan |
|---|---|---|
| **Node.js** | **22.x** (LTS) | WAJIB samain major version dgn hosting (22). Pakai installer dari nodejs.org atau `nvm`. |
| **npm** | bawaan Node 22 | cek `npm -v` |
| **Git** | terbaru | buat clone/pull repo |
| **PowerShell** | bawaan Windows | dipakai buat `zip-output.ps1` |
| **Python 3** | 3.x | dipakai INTERNAL oleh `zip-output.ps1` buat bikin zip Unix-perm. Cek `python --version`. Kalau ga ada, script fallback ke Compress-Archive (tapi nanti perlu chmod manual di server). |
| **VS Code** | opsional | editor |

> ⚠️ **Build HARUS di Windows.** Sandbox/WSL Linux sering gagal (oxc-parser native binding). Native Windows aman.

### 0.2 Ambil source code

```powershell
# kalau pakai git:
git clone <repo-url> lakara-nuxt
cd lakara-nuxt

# kalau copy manual: copy folder lakara-nuxt utuh, TAPI hapus dulu node_modules & .output (biar fresh)
```

### 0.3 Install dependencies

```powershell
cd C:\path\ke\lakara-nuxt
npm install
```

Ini auto-install semua dari `package.json` (lihat daftar di section 1.2).

### 0.4 Bikin file `.env` (untuk dev lokal)

Project baca env var. Buat file `.env` di root (JANGAN commit ke git):

```
NUXT_ADMIN_USER=admin
NUXT_ADMIN_PASS=Lakara@2024
NUXT_APP_URL=http://localhost:3000
NUXT_DATA_DIR=./data
NUXT_DB_HOST=localhost
NUXT_DB_PORT=3306
NUXT_DB_USER=root
NUXT_DB_PASS=
NUXT_DB_NAME=lakaraid_lakaracreative
NUXT_SMTP_HOST=mail.lakara.id
NUXT_SMTP_PORT=465
NUXT_SMTP_USER=noreply@lakara.id
NUXT_SMTP_PASS=xxxxx
NUXT_SMTP_FROM=Lakara
```

Buat folder `data` lokal (buat upload saat dev): `mkdir data`.

### 0.5 Database lokal (opsional, kalau mau dev penuh)

- Install MySQL/MariaDB lokal (atau XAMPP/Laragon).
- Buat DB `lakaraid_lakaracreative`, import `schema.sql`.
- Import seed kalau perlu: `seed-demo-stores.sql`, `seed-faq.sql`, `seed-testimonials.sql`, `seed-terms.sql`.
- ⚠️ Jalankan juga ALTER yang belum tentu ada di schema lama:
  ```sql
  ALTER TABLE stores ADD COLUMN IF NOT EXISTS product_image_ratio VARCHAR(10) DEFAULT '1:1';
  ```

### 0.6 Jalankan / build

```powershell
npm run dev      # dev server http://localhost:3000
npm run build    # build produksi → output di .output/
```

Setelah build sukses → lanjut ke **section 3 (Deploy ke hosting)**.

---

## 1. Project & Tech Stack

- **Folder lokal**: `C:\Users\rhyno\Desktop\lakara-daily\lakara-nuxt`
- **Framework**: Nuxt 3 (SSR), Vue 3 `<script setup>`, TypeScript
- **UI**: @nuxt/ui (Tailwind built-in), Tabler Icons (`i-tabler-*`)
- **CSS global**: `assets/css/main.css` — **WAJIB terdaftar di `nuxt.config.ts` → `css: ['~/assets/css/main.css']`** (kalau hilang, `.section` spacing & animasi tombol mati)
- **Database**: MySQL `lakaraid_lakaracreative` (schema di `schema.sql`)
- **DB helper**: `server/utils/db.ts` → `query()`, `queryOne()`, `execute()`
- **Flat-file storage**: sebagian fitur baca JSON dari data dir (`seo.json`, `artikel.json`); ada juga tabel `settings` (key-value TEXT) buat Terms.
- **Domain**: lakara.id

### 1.2 Dependencies (dari package.json)

**dependencies**
```
@iconify-json/tabler  ^1.2.5   ← icon set Tabler
@nuxt/ui              ^2.18.7  ← komponen UI + Tailwind built-in
mysql2                ^3.22.5  ← driver MySQL (WAJIB di-bundle saat deploy)
nodemailer            ^6.9.0   ← kirim email SMTP
nuxt                  ^3.13.2  ← framework
seq-queue             ^0.0.5   ← dependency mysql2
sqlstring             ^2.3.3   ← dependency mysql2
```

**devDependencies**
```
typescript  ^5.5.0
vue-tsc     ^2.0.0
```

**scripts** (di package.json):
```
dev     = nuxt dev
build   = nuxt build
start   = node .output/server/index.mjs
preview = nuxt preview
static  = nuxt generate
```

> Tailwind, PostCSS, Vite, Nitro semua sudah include di dalam Nuxt / @nuxt/ui — tidak perlu install terpisah.

## 2. Hosting (Arenhost cPanel — Node.js App)

- **Mode**: Node.js App (Passenger) di cPanel Arenhost
- **Application root**: `lakara` (TANPA trailing slash — penting!)
- **Startup file**: `.output/server/index.mjs`
- **Node version**: 22.x
- **App folder server**: `/home/lakaraid/lakara/`
- **Data dir (upload + seo.json + artikel.json)**: `/home/lakaraid/data` (env `NUXT_DATA_DIR`)
- **Virtual env (Terminal)**: `source /home/lakaraid/nodevenv/lakara/22/bin/activate && cd /home/lakaraid/lakara`

### Env vars di cPanel (Setup Node.js App → Environment variables)
```
NUXT_ADMIN_USER=admin
NUXT_ADMIN_PASS=Lakara@2024
NUXT_APP_URL=https://lakara.id
NUXT_DATA_DIR=/home/lakaraid/data
NUXT_DB_HOST=localhost
NUXT_DB_PORT=3306
NUXT_DB_USER=lakaraid_yoga          ← user DB (sudah di-Add To Database + ALL PRIVILEGES)
NUXT_DB_PASS=Dyxripp1425!
NUXT_DB_NAME=lakaraid_lakaracreative
NUXT_SMTP_HOST=mail.lakara.id
NUXT_SMTP_PORT=465
NUXT_SMTP_USER=noreply@lakara.id
NUXT_SMTP_PASS=Dyxripp1425!
NUXT_SMTP_FROM=Lakara
```

## 3. Cara Deploy / Update ke Hosting (PENTING — ikuti urut persis)

> Build HARUS di Windows (sandbox Linux tidak kompatibel oxc-parser).

**Langkah lengkap (sama persis tiap kali update):**

```powershell
cd C:\Users\rhyno\Desktop\lakara-daily\lakara-nuxt

# 1. BUILD
npm run build

# 2. (cek anti-OOM) nitro.mjs tidak boleh terpotong: baris terakhir harus "export { ... }"
powershell -Command "Get-Content .output/server/chunks/_/nitro.mjs | Select-Object -Last 3"

# 3. ZIP (Unix permission, jadi tidak perlu chmod di server)
powershell -ExecutionPolicy Bypass -File zip-output.ps1
```

`zip-output.ps1` otomatis: cek nitro.mjs → fix package.json → copy `mysql2` + deps → bikin `output.zip` dengan **Unix permission** (`create_system=3`, via Python; fallback Compress-Archive). Output bagus = **"Done (UNIX perms, no chmod needed)"**.

Lalu di **cPanel File Manager → folder `lakara`**:

1. **HAPUS folder `.output` lama** dulu
2. Upload `output.zip` → **Extract**
3. **Setup Node.js App → Restart**

### Alternatif extract via cPanel Terminal (lebih reliable):
```bash
cd /home/lakaraid/lakara && rm -rf .output && unzip -o output.zip && chmod -R 755 .output
```
Lalu **Restart** di panel.

### Ringkasan singkat (yang user hafal):
> `npm run build` → `powershell -ExecutionPolicy Bypass -File zip-output.ps1` → hapus `.output` → extract `output.zip` → **Restart Node**.

### File non-code yang di-upload manual ke `/home/lakaraid/data/`
- `seo.json` (SEO per halaman)
- `artikel.json` (blog/artikel)

### Perubahan DB yang harus dijalankan di phpMyAdmin (sekali)
```sql
-- rasio gambar produk
ALTER TABLE stores ADD COLUMN IF NOT EXISTS product_image_ratio VARCHAR(10) DEFAULT '1:1';
```
Import seed kalau perlu: `seed-terms.sql` (isi default Terms), `seed-demo-stores.sql`, `seed-faq.sql`, `seed-testimonials.sql`.

### ⚠️ Fitur link-bio TIDAK butuh migrasi DB
Semua disimpan di kolom JSON `stores.links_bio` — tidak perlu ALTER TABLE untuk field baru.

## 4. Troubleshooting (sudah pernah kejadian — solusinya)

| Gejala | Penyebab | Fix |
|---|---|---|
| **500** saat buka lakara.id | `nitro.mjs` ga ketemu / file korup | cek `.output/server/chunks/_/nitro.mjs` ada |
| **500 / Permission denied** di `chunks/_/nitro.mjs` | Extract GUI bikin folder tanpa execute-bit (zip permission bug) | `chmod -R 755 .output` di Terminal, atau pakai zip Unix-perm |
| **503** setelah Restart | App crash saat boot / masih booting | tunggu 20 dtk; kalau tetap, baca `stderr.log` |
| **ERR_MODULE_NOT_FOUND nitro.mjs** | double-slash app root `lakara//` ATAU file hilang | Application root = `lakara` (tanpa `/`) |
| **SEMUA domain/subdomain 503 + Terminal "Unable to fork" (255)** | CloudLinux **LVE NPROC limit** (proses penuh, ~200/200) — BUKAN RAM/CPU | STOP app Node yang tidak dipakai; tunggu 1 menit; blok IP flooding. Node app = proses persisten mahal; WordPress idle murah. |
| **build OOM → nitro.mjs terpotong** | RAM kurang saat Rollup | tutup app berat, build ulang; cek tail nitro.mjs |
| **SEO ga berubah di Google** | live = build LAMA (hardcode title) | deploy build baru; minta re-crawl (Search Console / FB Sharing Debugger) |

### Baca log error
- cPanel File Manager → `/home/lakaraid/lakara/stderr.log` → View (baca bagian BAWAH)
- Reset log: `> stderr.log` di Terminal (aman, dibuat ulang otomatis)

## 5. Struktur Penting

```
lakara-nuxt/
├── nuxt.config.ts            ← ssr, nitro node-server, externals mysql2, css:[main.css]
├── package.json              ← deps (lihat section 1.2)
├── zip-output.ps1            ← build zip Unix-perm (butuh Python utk perm)
├── schema.sql                ← MySQL schema (kolom links_bio = JSON)
├── seed-*.sql                ← seed: demo-stores, faq, testimonials, terms
├── seo.json / artikel.json   ← upload ke /home/lakaraid/data/
├── assets/css/main.css       ← .section spacing + animasi tombol (.anim-*) + font
├── public/ favicon.svg, favicon-round.svg, og-cover.svg, stock/*.svg
├── layouts/  default | admin | member.vue
├── components/ProfilePhotoUploader.vue  ← foto profil + GIF avatar (premium)
├── composables/ useMember, useAdmin, useImageCompress, useSiteConfig, useSeoPage
├── pages/
│   ├── pricing.vue           ← toggle Bulanan/Tahunan (-15%)
│   ├── [toko]/index.vue      ← LINK BIO publik (wallpaper, warna, card, font, social row, verified, produk, animasi)
│   ├── [toko]/store.vue      ← storefront produk
│   ├── [toko]/[produk].vue   ← detail produk
│   ├── member/ links/index.vue (editor link bio), profile.vue, store.vue, account.vue, terms.vue, products/
│   └── admin/ members/index.vue, stores/, uploads/, terms.vue, seo, settings.vue
└── server/
    ├── api/member/  links.get|post, store.post, products.post, upload.post, auth, password
    ├── api/admin/   members.get|post, stores, uploads.cleanup.post, terms.post, settings
    ├── api/terms.get.ts             ← baca Terms (public)
    ├── api/file/[filename].get.ts   ← serve upload (img/gif/mp4/webm + MIME)
    └── utils/  db.ts, data.ts (checkAuth), member.ts (hashPassword), uploads.ts (cleanup), email.ts, rateLimit.ts
```

## 6. Tier System (Free / Pro / Premium)

`store.product_tier`: `'free' | 'pro' | 'premium'`. `tier_expires_at` null = tidak expired.

| Fitur | Free | Pro | Premium |
|---|:--:|:--:|:--:|
| Jumlah link bio | 5 | ∞ | ∞ |
| Template + warna + gradient wallpaper | ✅ | ✅ | ✅ |
| Stock image card | ✅ | ✅ | ✅ |
| Hide/show nama & bio | ✅ | ✅ | ✅ |
| Row ikon sosmed (pilih gaya outline/color) | ✅ | ✅ | ✅ |
| Font kustom (banyak pilihan) | ❌ | ✅ | ✅ |
| Upload gambar statis (card) | ❌ | ✅ (2MB) | ✅ |
| Upload GIF (card & avatar) | ❌ | ❌ | ✅ (5MB) |
| Wallpaper foto/video | ❌ | ❌ | ✅ (video 8MB) |
| Card style / radius / featured link | ❌ | ✅ | ✅ |
| Analitik klik | ❌ | ✅ | ✅ |
| Animasi tombol (pulse/bounce/shake/glow) | ❌ | ❌ | ✅ |
| Verified badge (centang biru) | ❌ | ❌ | ✅ |
| Hide branding Lakara | ❌ | ❌ | ✅ |
| Spotlight produk di link bio (on/off) | ✅ | ✅ | ✅ |

Gating dobel: di UI **dan** di server (`links.post.ts` / `upload.post.ts`). Saat downgrade, fitur premium di-strip saat save berikutnya.

## 7. Data model `links_bio` (JSON di kolom stores.links_bio)

```
title, bio,
show_name (bool), show_bio (bool),
font_family (default + list, Pro+),
bg_type ('solid'|'gradient'|'image'|'video'), bg_color,
gradient_from, gradient_to, gradient_angle,
bg_image, bg_video,                       ← premium
text_color, accent_color, title_color, bio_color, button_color, button_text_color,
template, card_style, card_radius, card_bg_color,
social_style ('outline'|'color'), socials: [ { platform, url } ],
hide_branding,                            ← premium
verified,                                 ← premium (centang biru)
show_products,                            ← toggle spotlight produk
button_animation ('none'|'pulse'|'bounce'|'shake'|'glow'),  ← premium
links: [ { id, type, label, url, image, enabled, featured } ]
```
- `image` per link = latar penuh kartu (free=stock /stock/, pro=+upload statis, premium=+GIF/url)
- Avatar = `store.logo` (bukan di links_bio; bisa GIF utk premium)

## 8. Terms of Service (Lakara Bio & Storefront — terpisah dari Lakara Creative)

- Konten disimpan di tabel **`settings`** key **`member_terms`** (HTML). Edit lewat admin **tanpa rebuild**.
- `pages/member/terms.vue` → halaman publik `/member/terms` (layout `default`, tanpa auth — bisa dibaca saat daftar).
- `pages/admin/terms.vue` → editor admin `/admin/terms` (textarea HTML + preview).
- `server/api/terms.get.ts` (baca) & `server/api/admin/terms.post.ts` (simpan, upsert settings).
- `pages/member/register.vue` → checkbox WAJIB centang sebelum tombol Daftar aktif.
- Link "Syarat & Ketentuan" ada di sidebar member (`layouts/member.vue`) & menu admin (`layouts/admin.vue`).
- Default konten di `seed-terms.sql` (import sekali biar halaman langsung ada isinya).

## 9. Image cleanup (hemat storage, tanpa cron)

- `server/utils/uploads.ts`: `collectUploadFiles(store)` scan logo/products/links_bio; `deleteOrphanUploads(old,new)` hapus file yg sudah tidak dipakai; `cleanupUnusedUploads(allStores)` global.
- **Auto delete-on-replace**: dipanggil setelah UPDATE di `store.post.ts`, `links.post.ts`, `products.post.ts`.
- **Tombol admin** "Hapus File Tak Terpakai" di `/admin/uploads` → `POST /api/admin/uploads.cleanup` (manual, no cron, biar server tidak berat).

## 10. Changelog (kumulatif)

1. **Fix 500/503 deploy**: zip permission bug → `chmod`/Unix-perm zip; double-slash app root; **LVE NPROC limit** (semua domain 503).
2. **UX foto profil**: komponen `ProfilePhotoUploader`, halaman Edit Profil, avatar sidebar clickable, foto di Akun & Password, relabel Logo→Foto Profil.
3. **Link bio Fase 1**: warna granular, wallpaper (solid/gradient/foto/video), 10+ template, full-image card, fix bio abu-abu.
4. **Fase 2**: GIF avatar, animasi tombol, verified badge, spotlight produk.
5. **Fase A**: hide/show nama & bio, font picker (Pro+), row ikon sosmed (pilih gaya outline/color), lebih banyak platform.
6. **Pricing**: toggle Bulanan/Tahunan (-15%).
7. **Fix spacing global**: `main.css` belum ke-load → didaftarkan di nuxt.config.
8. **CRUD admin members**: fix 500 (member_email UNIQUE bentrok ''), flow 2-step (Nonaktifkan → Hapus), responsive.
9. **Seed data**: 3 demo store (foto produk DummyJSON), 13 FAQ, 8 testimoni, seo.json, artikel.json.
10. **Branding**: favicon SVG transparan + versi bulat, og-cover (OG image harus PNG raster utk sosmed).
11. **Image cleanup**: delete-on-replace otomatis + tombol cleanup admin (tanpa cron).
12. **Terms of Service**: halaman publik + editor admin + checkbox wajib di daftar + link di member/admin + seed default.

## 11. Roadmap berikutnya (belum dikerjakan)

- **Fase C — QR code**: generator + download QR per link bio (Pro/Premium).
- **Fase D — Monetisasi/analitik**: Lead capture (WA/email) + analitik lanjutan (lokasi/device/jam/referrer).
- **Custom domain** per member (⚠️ infra berat di shared hosting; cek dukungan Arenhost: addon domain + routing via Host header).
- Ide lain: scheduled links, sticky CTA mobile, lebih banyak template.

## 12. Catatan teknis penting

- **Build HARUS di Windows** (bukan sandbox Linux — oxc-parser native gagal).
- `zip-output.ps1` butuh **Python** terpasang untuk bikin Unix-perm zip (kalau tidak, fallback + perlu `chmod -R 755 .output` di server).
- Setiap deploy: **hapus `.output` lama** dulu sebelum extract.
- App root `lakara` tanpa trailing slash.
- Admin URL: `lakara.id/admin` (pass: `Lakara@2024`). Member login: `lakara.id/member`.
- **OG image** untuk sosmed harus **PNG raster** (SVG tidak dirender platform). Favicon boleh SVG.
- GIF jangan lewat kompres canvas (animasi hilang) — upload raw.
- `member_email` punya UNIQUE KEY → jangan set ke `''` (pakai sentinel/DELETE).
- hashPassword = `sha256(password + 'lakara_salt')`; ekuivalen MySQL `SHA2(CONCAT(pw,'lakara_salt'),256)`.
- **Quirk sandbox Claude**: kadang baca file via bash kebaca terpotong (stale mount). Validasi pakai Read/Grep tool, atau andalkan `npm run build` di Windows sebagai gate compile final.
```
