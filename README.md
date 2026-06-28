# Lakara — Platform Digital All-in-One

Platform digital milik **PT Lakara Solusi Kreatif** yang mencakup:

- **Link Bio** (`lakara.id/{slug}`) — halaman bio link publik seperti Linktree
- **Storefront** (`lakara.id/{slug}/store`) — toko online sederhana
- **Member Portal** (`/member`) — dashboard kelola link bio, produk, dan profil
- **Admin Panel** (`/admin`) — manajemen toko, member, konten, dan upgrade tier
- **Client Portal** (`/client`) — modul agency: brief, kalender konten, invoice, laporan, tim

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Nuxt 3.13.2 (SSR + Nitro) |
| UI | @nuxt/ui 2.18.7 (Tailwind CSS) |
| Database | MySQL via `mysql2` (pool) |
| Payment | Tripay Closed Payment (HMAC-SHA256) |
| Email | Nodemailer (SMTP) |
| Auth | Cookie-based (`lakara_admin`, `lakara_member`, `lakara_portal`) |
| Hosting | Arenhost cPanel — Node.js App (Passenger), Node 22.x |
| Build | **Windows only** (oxc-parser native binding tidak support Linux) |

---

## Setup Lokal

### 1. Install dependencies

```bash
npm install
```

### 2. Buat file `.env`

```bash
cp .env.example .env
```

Isi nilai yang diperlukan (lihat bagian [Environment Variables](#environment-variables) di bawah).

### 3. Setup database

Jalankan SQL berikut secara berurutan di MySQL:

```sql
-- Wajib (urutan penting!)
source schema.sql
source payment-migration.sql
source email-verification-migration.sql
source client-portal-migration.sql
source client-portal-f6-migration.sql
source client-portal-attendance-migration.sql
source referral-migration.sql

-- Opsional (data demo)
source seed-faq.sql
source seed-terms.sql
source seed-testimonials.sql
source seed-demo-stores.sql
```

### 4. Jalankan development server

```bash
npm run dev
```

Buka `http://localhost:3000`

- Admin login: `/admin` — user/pass dari `NUXT_ADMIN_USER` / `NUXT_ADMIN_PASS`
- Client Portal super admin: `admin@lakara.id` / `Lakara@2024`

---

## Environment Variables

Buat file `.env` di root project. Di server, set via **cPanel Node.js App Manager → Environment Variables**.

```env
# Database
NUXT_DB_HOST=localhost
NUXT_DB_PORT=3306
NUXT_DB_USER=lakaraid_user
NUXT_DB_PASS=secret
NUXT_DB_NAME=lakaraid_lakaracreative

# Admin
NUXT_ADMIN_USER=admin
NUXT_ADMIN_PASS=Lakara@2024

# Upload storage (path absolut di luar public_html)
NUXT_DATA_DIR=/home/lakaraid/data

# Email (SMTP)
NUXT_SMTP_HOST=mail.lakara.id
NUXT_SMTP_PORT=465
NUXT_SMTP_USER=noreply@lakara.id
NUXT_SMTP_PASS=secret
NUXT_SMTP_FROM=Lakara <noreply@lakara.id>

# URL publik
NUXT_APP_URL=https://lakara.id

# Tripay Payment Gateway
NUXT_TRIPAY_API_KEY=...
NUXT_TRIPAY_PRIVATE_KEY=...
NUXT_TRIPAY_MERCHANT_CODE=T18230
NUXT_TRIPAY_MODE=production

# Cron secret (endpoint /api/cron/expire-tiers)
NUXT_CRON_SECRET=rahasia-cron
```

> **Penting:** `NUXT_SMTP_FROM` wajib format `Nama <email@domain>`, bukan hanya nama.

---

## Deploy ke Produksi (Arenhost)

> **Build wajib dilakukan di Windows.** `oxc-parser` (dipakai Nuxt) tidak punya native binding untuk Linux.

### Prasyarat

- Node.js 22.x terinstall di Windows lokal
- `curl.exe` tersedia (sudah built-in Windows 10+)
- File `scripts/.deploy.env` sudah diisi (lihat `scripts/.deploy.env`)
- FTP account sudah dibuat di cPanel Arenhost

### Langkah Deploy

**1. Build**

```powershell
npm run build
```

Output di `.output/`. Pastikan ukurannya ~20 MB+. Kalau kurang dari 15 MB, build kemungkinan tidak lengkap.

**2. Deploy otomatis**

```powershell
powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1
```

Script ini akan:
1. Zip isi `.output/` (tanpa folder wrapper)
2. Upload zip ke server via FTP
3. Trigger webhook untuk: hapus `.output` lama → extract zip → restart app (`touch tmp/restart.txt`)
4. Tampilkan log tiap langkah dari server

**Dry run** (cek tanpa benar-benar upload):

```powershell
powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1 -DryRun
```

### Konfigurasi Deploy (`scripts/.deploy.env`)

```env
FTP_HOST=195.88.211.140
FTP_PORT=21
FTP_USER=lakaraftp@lakara.id
FTP_PASS=...

# Path di FTP (relatif terhadap chroot FTP)
# Jika FTP chroot = /home/lakaraid/ maka tulis /lakara
# Jika FTP akses penuh maka tulis /home/lakaraid/lakara
FTP_DIR=/lakara

REMOTE_DIR=/home/lakaraid/lakara

# Webhook untuk jalankan perintah di server setelah upload
TRIGGER_URL=https://trigger.lakara.id/index.php
SHELL_TOKEN=...
```

### Deploy Manual (tanpa script)

Kalau tidak bisa pakai script otomatis:

```bash
# 1. Di Windows — build
npm run build

# 2. Zip folder .output (isi saja, bukan folder .output-nya)
# Pakai Windows Explorer: masuk ke .output, pilih semua, klik kanan → Send to Compressed folder

# 3. Upload zip ke /home/lakaraid/lakara/ via cPanel File Manager atau FTP

# 4. Di server (cPanel Terminal atau SSH):
cd /home/lakaraid/lakara
rm -rf .output
mkdir .output
unzip -o -qq deploy-lakara.zip -d .output
rm deploy-lakara.zip
touch tmp/restart.txt
```

### Cek Deployment Berhasil

- Buka `https://lakara.id` — halaman harus muncul
- Buka `https://lakara.id/member` — redirect ke halaman login member
- Buka `https://lakara.id/admin` — redirect ke halaman login admin
- Periksa `stderr.log` di File Manager (`/home/lakaraid/lakara/`) jika ada error

---

## Setup Awal di Server (First Time)

### 1. Buat Node.js App di cPanel

- cPanel → Node.js App Manager → **Create Application**
  - Node version: `22.x`
  - App root: `lakara/`
  - Startup file: `.output/server/index.mjs`

### 2. Set Environment Variables

cPanel → Node.js App Manager → klik app → **Environment Variables** → isi semua nilai dari bagian `.env` di atas.

### 3. Buat Database

cPanel → MySQL Databases → buat database + user → assign user ke database → jalankan semua SQL migration (urutan di atas).

### 4. Buat direktori data

```bash
mkdir -p /home/lakaraid/data
```

Path ini harus sama dengan nilai `NUXT_DATA_DIR`.

### 5. Deploy pertama kali

Jalankan `scripts\deploy.ps1` dari Windows lokal, atau upload manual seperti di atas.

---

## Cron Jobs (Opsional)

Pasang di cPanel → Cron Jobs:

```bash
# Auto-downgrade tier member yang expired — setiap hari jam 01:00
0 1 * * *  curl -s "https://lakara.id/api/cron/expire-tiers?key=NUXT_CRON_SECRET_VALUE" > /dev/null

# Generate invoice langganan bulanan — setiap tanggal 1 jam 08:00
0 8 1 * *  curl -s -X POST "https://lakara.id/api/portal/invoices/generate-recurring" -H "X-Token: SHELL_TOKEN_VALUE" > /dev/null

# Backup database harian — jam 02:00
0 2 * * *  /bin/bash /home/lakaraid/backup-db.sh
```

Lihat `scripts/backup-db.sh` untuk setup backup database.

---

## Struktur Direktori

```
lakara/
├── pages/
│   ├── [toko]/          # Halaman publik toko (bio link, storefront)
│   ├── member/          # Member portal
│   ├── admin/           # Admin panel
│   └── client/          # Client portal (agency)
├── server/
│   ├── api/             # API endpoints
│   └── utils/           # db.ts, member.ts, tripay.ts, email.ts, portal.ts
├── components/
├── layouts/             # default, admin, member, portal
├── composables/
├── scripts/
│   ├── deploy.ps1       # Script deploy Windows
│   ├── .deploy.env      # Kredensial FTP + webhook (jangan di-commit!)
│   └── backup-db.sh     # Script backup database
├── *.sql                # Database migrations
├── nuxt.config.ts
└── .env                 # Kredensial lokal (jangan di-commit!)
```

---

## Scripts

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Development server (localhost:3000) |
| `npm run build` | Build produksi → `.output/` |
| `npm run start` | Jalankan server produksi lokal |
| `npm run preview` | Preview build produksi lokal |

---

## Troubleshooting

**Error: `ERR_MODULE_NOT_FOUND: chunks/_/nitro.mjs`**
Build `.output` tidak lengkap. Ukuran zip harus ~20 MB+. Rebuild di Windows → upload ulang.

**Error: API masih pakai sandbox padahal sudah set production**
Set env via cPanel Node.js App Manager (bukan `.env` file) → restart app.

**Error: `failed to load icon 'tabler:...'`**
Pastikan `nuxt.config.ts` punya:
```ts
icon: { serverBundle: 'local', clientBundle: { scan: true } }
```
Lalu rebuild dan redeploy.

**Deploy zip terlalu kecil**
Kalau zip < 15 MB, kemungkinan `node_modules` di dalam `.output/server/` tidak ikut terbuild. Coba hapus `.nuxt/` dan `.output/` lalu `npm run build` ulang.
