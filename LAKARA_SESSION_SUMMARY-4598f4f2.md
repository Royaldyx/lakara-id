# Lakara Nuxt — Session Summary
> Simpan file ini. Paste isi file ini di awal sesi baru supaya Claude langsung paham konteks.

---

## Project
- **Folder**: `C:\Users\rhyno\Desktop\lakara-daily\lakara-nuxt`
- **Stack**: Nuxt 3 SSR, @nuxt/ui, Tailwind CSS, Tabler Icons
- **Hosting**: Arenhost Node.js (cPanel) — startup file: `.output/server/index.mjs`
- **Domain**: lakara.id
- **Data**: Sedang migrasi dari flat-file JSON ke **MySQL** (task #16 in_progress)

### Env vars di Arenhost (Setup Node.js App)
```
NUXT_ADMIN_USER=admin
NUXT_ADMIN_PASS=Lakara@2024
NUXT_DATA_DIR=/home/lakaraid/data
NUXT_DB_HOST=localhost
NUXT_DB_PORT=3306
NUXT_DB_USER=lakaraid_user       ← isi sesuai DB yang dibuat
NUXT_DB_PASS=...                  ← isi sesuai DB yang dibuat
NUXT_DB_NAME=lakaraid_lakaracreative
```

### Database MySQL
- **Database**: `lakaraid_lakaracreative` (buat di cPanel → MySQL Databases)
- **Schema**: `schema.sql` di root project — jalankan di phpMyAdmin
- **Helper**: `server/utils/db.ts` — `query()`, `queryOne()`, `execute()`

---

## Status Migrasi MySQL (task #16 — IN PROGRESS)

Task: migrate semua API dari flat-file JSON ke MySQL.

**Tabel MySQL yang sudah ada di schema.sql:**
- `stores` — toko + produk + links_bio + tier info (products & links_bio stored as JSON column)
- `reset_tokens` — token forgot password
- `pending_members` — pendaftaran member menunggu approval
- `upgrade_requests` — request upgrade ke Pro
- `settings` — key-value admin settings
- `newsletter` — subscriber newsletter

**Status per API** — belum diketahui mana yang sudah di-migrate, mana yang masih flat-file. Perlu dicek di sesi berikutnya.

---

## Fitur yang sudah dibangun

### 1. Pro Tier Upgrade System
- **Free**: max 10 produk
- **Pro**: unlimited, Rp 20.000/bulan (bisa diset promo di admin settings)
- Flow: Member request → admin approve/reject → tier aktif N bulan
- File: `server/api/member/upgrade-request.post.ts`, `upgrade-status.get.ts`, `server/api/admin/upgrade-requests.*`
- Pages: `pages/admin/upgrade-requests/index.vue`, `pages/admin/settings.vue`
- Settings bank di `settings.json`: `bank_name`, `bank_account`, `bank_holder`, `upgrade_price`, `upgrade_promo`

### 2. Member Store + Link Bio
- Setiap member punya halaman di `lakara.id/[toko]`
- `[toko]/index.vue` → **Link Bio page** (bukan storefront)
- `[toko]/store.vue` → **Storefront** (produk)
- `[toko]/[produk].vue` → product detail
- Marketplace links: Shopee, Tokopedia, Lazada, Blibli, TikTok Shop
- Links API: `server/api/member/links.get.ts`, `links.post.ts`
- Member links page: `pages/member/links.vue`
- Member nav updated di `layouts/member.vue`

### 3. Forgot Password
- Flow: Email → token link → reset
- Files: `server/api/member/forgot-password.post.ts`, `reset-password.post.ts`, `validate-reset-token.get.ts`
- Pages: `pages/member/forgot-password.vue`, `pages/member/reset-password.vue`
- Email via Nodemailer (`server/utils/email.ts`)

### 4. Security Fix — Admin Token
- Auth token sekarang SHA256 hash, bukan raw password
- `server/api/auth.post.ts` + `server/utils/data.ts`

### 5. Mobile Fixes (sudah dikerjakan, status deploy tidak pasti)
1. Simpan button di bawah — `pages/member/products/edit.vue`
2. Hamburger mobile member portal — `layouts/member.vue`
3. Layout Lakara muncul di halaman toko — `app.vue`
4. Hapus field "Website" dari marketplace

---

## Deployment Flow

1. Di Windows terminal:
   ```
   cd C:\Users\rhyno\Desktop\lakara-daily\lakara-nuxt
   npm run build
   ```
   > **JANGAN** build di sandbox Claude (Linux, oxc-parser tidak kompatibel)

2. Setelah build selesai, jalankan `zip-output.ps1`:
   ```
   powershell -ExecutionPolicy Bypass -File zip-output.ps1
   ```
   Script ini: copy mysql2 + deps ke `.output/server/node_modules/` → buat `output.zip`

3. Upload `output.zip` ke folder `lakara` di Arenhost via cPanel File Manager

4. **Hapus folder `.output/` lama dulu** sebelum extract (penting!)

5. Extract → struktur: `lakara/.output/server/index.mjs`

6. Klik **Restart** di Node.js panel Arenhost

---

## MySQL2 Deployment Fix (SOLVED — tidak perlu diulang)

**Problem**: `nitro.mjs` truncated / `Cannot find package 'mysql2'`

**Fix yang sudah diterapkan:**
1. `nuxt.config.ts` — `nitro.externals.external: ['mysql2']` → mysql2 tidak di-bundle
2. `zip-output.ps1` — copy mysql2 ke `.output/server/node_modules/` sebelum zip
3. **Di server** — sudah jalankan `npm install mysql2` di `/home/lakaraid/lakara/` via cPanel Terminal

**mysql2 sudah permanent di server** di `/home/lakaraid/lakara/node_modules/mysql2`. Selama tidak dihapus, tidak perlu install ulang.

---

## ⚠️ Deploy Issue: ZIP Permission Bug (SOLVED — Juni 2026)

### Problem
Saat extract `output.zip` di server, muncul ratusan error:
```
checkdir error: cannot create .output/server/chunks/build — Permission denied
checkdir error: cannot create .output/server/node_modules/... — Permission denied
```

### Root Cause
`zip-output.ps1` pakai Python `zipfile` module di Windows. Python zipfile di Windows set `create_system=0` (MS-DOS/Windows), bukan `create_system=3` (Unix). Akibatnya, direktori diekstrak **tanpa execute bit** di Linux → tidak bisa masuk ke subdirektori → semua file di dalamnya gagal dibuat.

### Fix Permanen — Update `zip-output.ps1`
Ganti bagian buat zip di `zip-output.ps1` dengan script Python yang set Unix permissions:

```python
import zipfile, os, stat

src = ".output"
out = "output.zip"

with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(src):
        for d in dirs:
            dirpath = os.path.join(root, d)
            arcname = os.path.relpath(dirpath, '.') + '/'
            info = zipfile.ZipInfo(arcname)
            info.create_system = 3  # Unix
            info.external_attr = (stat.S_IFDIR | 0o755) << 16
            zf.writestr(info, b'')
        for f in files:
            filepath = os.path.join(root, f)
            arcname = os.path.relpath(filepath, '.')
            info = zipfile.ZipInfo(arcname)
            info.create_system = 3  # Unix
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            with open(filepath, 'rb') as fh:
                zf.writestr(info, fh.read())
```

### Fix Sementara (kalau sudah terlanjur upload zip lama)
Jalankan di cPanel Terminal sebelum extract:
```bash
cd /home/lakaraid/lakara
chmod -R 755 .output/server   # atau hapus .output dulu kalau belum extract
unzip -o output.zip
```

---

## ⚠️ Deploy Issue: nitro.mjs Truncated (SOLVED — sebelum Juni 2026)

### Problem
`npm run build` di Windows kehabisan RAM (OOM) saat Rollup nulis bundle → `.output/server/chunks/_/nitro.mjs` terpotong di tengah fungsi `GracefulShutdown.shutdown()` (berhenti di line 7146).

### Fix
File di-reconstruct manual dari Nitro source packages. File yang benar: 7207 baris / 230,750 bytes. Tail yang ditambahkan:
- Completion of `GracefulShutdown.shutdown()`
- `getGracefulShutdownConfig()`
- `setupGracefulShutdown()`
- Final export statement dengan semua fungsi yang diimport oleh `index.mjs`

**`index.mjs` mengimport 6 fungsi dari `nitro.mjs`:**
```js
t=toNodeListener, d=destr, u=useRuntimeConfig,
a=trapUnhandledNodeErrors, s=setupGracefulShutdown, b=useNitroApp
```

### Pencegahan
Kalau OOM terjadi lagi, cek apakah `nitro.mjs` hasil build terpotong dengan:
```bash
# Di Windows (cek baris terakhir harus ada export statement)
tail -5 .output/server/chunks/_/nitro.mjs
```
Baris terakhir harus berupa `export { ..., useRuntimeConfig as u, ... };`

---

## ⚠️ cPanel Bug: Double-Slash di Application Root (TO-DO — belum difix)

### Problem
Di cPanel "Setup Node.js App", kalau Application root diisi `lakara/` (dengan trailing slash), startup path jadi:
```
file:///home/lakaraid/lakara//.output/server/index.mjs
```
Double slash → file not found → app gagal start.

### Fix
Di cPanel → Setup Node.js App → Application root → ganti dari `lakara/` ke `lakara` (hapus trailing slash) → **Save**.

---

## Struktur Penting

```
lakara-nuxt/
├── app.vue                    ← layout router (toko bypass default layout)
├── nuxt.config.ts             ← ssr:true, nitro:node-server, externals:mysql2
├── schema.sql                 ← MySQL schema (jalankan di phpMyAdmin)
├── zip-output.ps1             ← script buat output.zip untuk deploy
├── assets/css/main.css        ← .section { py-24 md:py-32 }
├── layouts/
│   ├── default.vue            ← navbar Lakara
│   ├── admin.vue              ← sidebar admin + upgrade badge
│   └── member.vue             ← sidebar member + mobile hamburger
├── pages/
│   ├── index.vue              ← homepage + section toko
│   ├── [toko]/
│   │   ├── index.vue          ← Link Bio page (layout:false)
│   │   ├── store.vue          ← Storefront / produk (layout:false)
│   │   └── [produk].vue       ← product detail (layout:false)
│   ├── member/
│   │   ├── links.vue          ← manage link bio
│   │   ├── products/
│   │   │   ├── index.vue      ← list produk + tier UI
│   │   │   └── edit.vue       ← form tambah/edit produk
│   │   ├── forgot-password.vue
│   │   └── reset-password.vue
│   └── admin/
│       ├── upgrade-requests/index.vue
│       └── settings.vue
├── server/
│   ├── api/
│   │   ├── stores.get.ts      ← public store/product API
│   │   ├── auth.post.ts       ← admin login (SHA256 token)
│   │   ├── member/            ← auth, products, links, upgrade, forgot-pass, dll
│   │   └── admin/             ← members, upgrade-requests, settings, dll
│   └── utils/
│       ├── db.ts              ← MySQL pool: query(), queryOne(), execute()
│       ├── data.ts            ← readJson/writeJson + checkAuth (flat-file, legacy)
│       ├── email.ts           ← Nodemailer
│       ├── member.ts          ← hashPassword
│       └── rateLimit.ts       ← in-memory rate limiter
└── composables/
    └── useMember.ts           ← member auth state
```

---

## Task Backlog

| # | Task | Status |
|---|------|--------|
| 16 | Schema + APIs untuk FAQ & Testimonials (tabel `faq`, `testimonials` + API endpoints) | 🔄 in_progress |
| 17 | Admin pages untuk FAQ & Testimonials CRUD | ⏳ pending |
| 18 | Member showcase opt-in + homepage section | ⏳ pending |

---

## Hal Penting
- Nuxt build HARUS di Windows (bukan di sandbox Claude)
- Setelah upload zip baru → selalu **hapus .output lama dulu** → extract → Restart
- Zip harus dibuat dengan Python script yang set `create_system=3` (Unix permissions) — lihat bagian ZIP Permission Bug di atas
- cPanel Application root = `lakara` (tanpa trailing slash) — lihat bagian cPanel Bug di atas
- Admin URL: `lakara.id/admin` — pass: `Lakara@2024`
- Member login: `lakara.id/member`
- `product_tier: 'free' | 'pro'` di objek store
- `tier_expires_at` format ISO / DATETIME, null = tidak expired
