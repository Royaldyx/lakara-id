# Lakara — Session Handoff (untuk lanjut di sesi baru / model lain)

> Paste file ini + **`CLAUDE.md`** di awal sesi baru. Ini nangkep semua yang dikerjain di sesi terakhir
> supaya nggak ada yang miss. Baca **Bagian 0 (ATURAN KERAS)** dulu sebelum ngoding apa pun.

---

## 0. ATURAN KERAS (jangan sampai kelewat — ini hasil belajar susah payah)

1. **JANGAN hapus `package-lock.json`.** Sudah di-commit. Reinstall WAJIB pakai **`npm ci`**, bukan `npm install`.
2. **Versi di-pin EXACT (tanpa caret):** `nuxt: "3.21.6"`, `@nuxt/ui: "2.22.3"`, `@iconify-json/tabler: "1.2.5"`. Jangan naikin sembarangan.
3. **JANGAN pasang modul Nuxt SEO / dependency baru** tanpa alasan kuat + tes build. Sesi lalu `@nuxtjs/seo` bikin build jebol total (`esbuild Unexpected "/"`), ujungnya harus upgrade Nuxt 3.13→3.21. Sekarang stabil — jaga.
4. **Build di Windows.** Deploy pakai `scripts/deploy.ps1` (otomatis: npm install → build → zip → upload FTP/WinSCP → restart).
5. **Terminal:** CMD pakai `&&` buat gabung perintah (bukan `;`). PowerShell boleh `;`/`&&`. Kalau `npm run build` keblok execution policy → pakai `npm.cmd run build`.
6. **File tools > bash.** Workspace bash sering mati (disk penuh). Andalkan Read/Edit/Grep/Glob.

---

## 1. Yang DIKERJAKAN sesi ini (belum tentu semua ke-deploy — lihat Bagian 2)

### A. Client Portal `/client` — audit + F2 (Core Agency)
- Audit F1: aman, cuma tambah CSS transisi modal.
- **F2 SELESAI:** Brief mgmt, Content Calendar, Approval+Revisi (limit per paket), Client profile/onboarding.
- File API: `server/api/portal/{briefs,contents}/*`, `contents/[id]/review.post.ts`, `profile/*`.
- Pages: `pages/client/{briefs,calendar,approvals,profile}*`, `pages/client/admin/{briefs,calendar}*`.
- Helper baru: `composables/usePortalStatus.ts`, `components/PortalField.vue`, `db.ts→withTransaction()`, `portal.ts→getClientRevisionLimit()`.
- Client creation → transaksional.

### B. SEO (setelah drama, jadi MANUAL zero-dep)
- **Sempat coba `@nuxtjs/seo` → build jebol → dirollback → upgrade ke Nuxt 3.21.6.** (Lihat Aturan #3.)
- SEO sekarang: custom `server/routes/sitemap.xml.ts` + `robots.txt.ts`; JSON-LD via `useHead`:
  - Organization+WebSite global di `app.vue`
  - Article+Breadcrumb di `pages/artikel/[slug].vue` (computed `jsonLd`)
  - Product JSON-LD di `[toko]/[produk].vue` (sejak awal)
- Rich Results Test: Article + Breadcrumb + Organization ✅ tervalidasi.

### C. Batch fix + growth
- Hapus duplicate export `hashPassword` (portal.ts) → 4 importer ambil dari `member.ts`.
- `withTransaction` di `tripay/callback.post.ts` (paid+tier atomik) & `member/register.post.ts`.
- **Pro-conversion nudge** di `member/dashboard.vue` (free tier).
- **Analytics lebih dalam** (sumber/device/jam ramai) — ⚠️ **BUTUH MIGRATION** `analytics-enrich-migration.sql`.
- **4 template premium** baru (`aurora`,`luxe`,`glass`,`retrowave`) di links editor.

### D. Fitur baru batch akhir
- **See/hide password** — `components/PasswordInput.vue`, dipasang di 14 field (semua login/register/account/admin/portal).
- **QR Code link bio** (download PNG) di `member/dashboard.vue` (via api.qrserver.com, zero-dep).
- **Growth badge** — branding bio gratis link ke `member/register?ref={slug}` (dapat reward referral).
- **Safe-area WebView** — `layouts/member.vue` pakai `max(env(), var(--safe-area-inset-top/bottom))` + `viewport-fit=cover`. Fix top bar, sidebar (top+bottom), main, bottom nav.
- **Keyboard scroll** — `plugins/scroll-focus.client.ts` (input focus → scrollIntoView di mobile).
- **App min-version gate** — `server/api/app-config.get.ts` + `components/AppUpdateGate.vue` (mount di member layout) + field di Admin→Settings→Aplikasi Mobile. App buka `?appVersion=x.y.z+build`.
- **Import produk Shopee** — `server/api/member/import-product.post.ts` (best-effort, sering gagal dari server) + **bookmarklet** (jalur andal, `SHOPEE_IMPORT_BOOKMARKLET.md`) → `member/products/edit?shopee_import=<json>`. Card import di member **disembunyikan** (`v-if="false"`, dipakai admin via bookmarklet).
- **Ikon/logo custom per link (Premium)** — field `link.icon`, `sanitizeIcon()` di links.post.ts, upload di modal edit, render di `[toko]/index.vue`.
- **PWA offline** — `public/sw.js` upgrade ke `lakara-v2` (aset cache-first, HTML network-first+fallback, /api network-only). **TIDAK pakai @vite-pwa** (hindari risiko build).
- **Verify email dari admin** — action `verify_email` di `admin/members.post.ts`, badge + tombol "Verifikasi" di `admin/members/index.vue`, `members.get.ts` +`email_verified`.

---

## 2. YANG HARUS DILAKUKAN sebelum/saat DEPLOY berikutnya

**⚠️ MIGRATION DB (jalankan di phpMyAdmin, sekali):**
- [ ] `analytics-enrich-migration.sql` — ALTER `link_clicks` +`referrer` +`device` (WAJIB, else endpoint analytics 500).
- (Migration lain: kalau portal/email-verif dll sudah pernah dijalankan, skip. Cek daftar di README.md.)

**Deploy:**
```cmd
npm.cmd run build
powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1
git add -A && git commit -m "..."
```

**Setelah deploy:**
- [ ] Set **Admin → Settings → Aplikasi Mobile** (Versi Minimal + Link Update) kalau mau aktifin gate.
- [ ] PWA: buka-tutup app 1-2x biar SW `lakara-v2` aktif.
- [ ] Analytics: data referrer/device baru keisi dari kunjungan BARU (data lama kosong, wajar).

---

## 3. KOORDINASI dengan tim APP MOBILE (WebView Android)
- App inject CSS var: **`--safe-area-inset-top` & `--safe-area-inset-bottom`** (standar `env()` cuma top/right/bottom/left — **nggak ada `all`**).
- Set **`android:windowSoftInputMode="adjustResize"`** di activity WebView (biar keyboard nggak nutup input; web udah bantu scroll).
- App buka `lakara.id/member?appVersion=x.y.z+build` (semver+build). Min version diatur dari Admin.
- Repo project mobile: **user bikin sendiri di GitHub** (Claude nggak bisa login GitHub). Private repo + invite kolaborator.

---

## 4. FILE KONTEN/STRATEGI (bukan kode — boleh dipindah keluar repo, nggak usah di-commit)
- `LAKARA_BRAND_BRIEF.md` — konteks produk SaaS untuk AI content
- `LAKARA_ARTIKEL_GEMINI_PROMPT.md` — prompt + 37 ide artikel SEO
- `LAKARA_30_SCRIPT_TIKTOK_REELS.md` — 30 script short-form promo
- `LAKARA_AGENCY_BRIEF_DAN_CARI_KLIEN.md` — brief agency + playbook cari klien
- `LAKARA_TEAM_TASK_GENERATOR.md` — generator task tim (format = portal_tasks)
- `SHOPEE_IMPORT_BOOKMARKLET.md` — bookmarklet import produk + cara pasang
- `TIKTOK_OVERLAY_PLANNING.md` — planning project TERPISAH (overlay TikTok Live à la Tikfinity, stack Nuxt + tiktok-live-connector + WS + deploy Railway)

---

## 5. OPEN ITEMS / ide lanjutan (belum dikerjain, opsional)
- Import Shopee **Opsi B**: halaman admin `/admin/import-produk` + dropdown pilih toko (biar nggak login-as-member). Belum dibuat.
- **Stock logo** untuk ikon link (sekarang cuma upload) — butuh aset logo kurasi legal.
- Auto-hapus row `email_verifications` pas admin klik "Verifikasi" (sekarang token cuma expired sendiri — harmless).
- Safe-area fix belum diterapkan ke `layouts/admin.vue` & `layouts/portal.vue` (kalau app juga bungkus /admin atau /client, terapin pola sama kayak member).
- Promosi/GTM: campaign plan launch, copy announcement (dibahas, belum dibuat file-nya).

---

## 6. STRUKTUR KUNCI (buat orientasi cepat)
- Stack: Nuxt 3.21.6 (Vue 3 + TS), @nuxt/ui 2.22.3 (Tailwind), MySQL (mysql2), Tripay, Nodemailer, cPanel Node hosting.
- Auth: cookie `lakara_admin` / `lakara_member` / `lakara_portal` (portal = session DB + RBAC).
- Data model penting: `stores.links_bio` (JSON semua kustomisasi bio), `stores.products` (JSON), `link_clicks` (analytics), `settings` (key-value), tabel `portal_*` (client portal), `email_verifications` (token verif).
- Referensi TEKNIS LENGKAP ada di **`CLAUDE.md`** (changelog kumulatif + semua konvensi). Baca itu.
