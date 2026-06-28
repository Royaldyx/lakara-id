# Client Portal — Arsitektur & Rencana Implementasi

> Modul tambahan untuk **lakara.id** (divisi agency/SMM Lakara Indonesia).
> Diakses di **`/client`**. Dibangun **di atas** stack existing tanpa mengubah arsitektur, auth, atau DB utama.

---

## 0. Prinsip Integrasi (jangan rusak existing)

| Aturan | Implementasi |
|---|---|
| Jangan ubah auth existing | Portal punya auth **terpisah** (cookie `lakara_portal`), tidak menyentuh `lakara_admin` / `lakara_member` |
| Jangan ubah tabel existing | Semua tabel baru pakai prefix **`portal_`**. Tabel `stores`, `payments`, dst **tidak disentuh** |
| Reuse, jangan bikin ulang | Pakai ulang: `server/utils/db.ts`, `email.ts`, `uploads.ts`, `rateLimit.ts`, `tripay.ts`, `/api/file/[filename]`, design system @nuxt/ui |
| Modular | Semua route portal di bawah `/client/**` + `/api/portal/**`. Bisa dihapus tanpa efek ke modul lain |
| SPA mode | `routeRules: { '/client/**': { ssr: false } }` — sama pola dengan `/member` & `/admin` |

### Keputusan arsitektur kunci

**1. "Client" = entitas BARU, bukan `member`/`store` existing.**
Member existing = pengguna link-bio/storefront (`lakara.id/{slug}`). Client Portal = klien jasa agency Lakara (SMM, branding). Beda audiens, beda data → tabel & auth sendiri. *(Konfirmasi diperlukan — lihat akhir dokumen.)*

**2. Auth portal berdiri sendiri dengan RBAC 3 role.**
Auth `/admin` existing cuma 1 user via env (`adminUser`/`adminPass`) — tidak cukup untuk multi-admin + RBAC. Portal pakai tabel `portal_users` + session DB (`portal_sessions`) supaya bisa multi-user, role, dan revoke session. Pola hashing reuse `hashPassword` (SHA-256 + salt) yang sudah ada.

---

## 1. Analisis Integrasi dengan Sistem Existing

| Kebutuhan Portal | Sudah ada di Lakara? | Strategi |
|---|---|---|
| Koneksi MySQL | ✅ `getDb`, `query`, `queryOne`, `execute` | Reuse penuh |
| Hashing password | ✅ `hashPassword` di `member.ts` | Reuse |
| Upload file | ✅ `uploads.ts` + `NUXT_DATA_DIR` + `/api/file/[filename]` | Reuse + tambah validasi mime/size khusus portal |
| Kirim email | ✅ `sendEmail` (nodemailer) | Reuse untuk notifikasi |
| Rate limit | ✅ `rateLimit.ts` | Reuse di login & endpoint sensitif |
| Pembayaran | ✅ Tripay (`tripay.ts`) | Reuse untuk bayar invoice (opsional, fase lanjут) |
| PDF | ❌ belum ada | Tambah util generate PDF (invoice & report) |
| Realtime | ❌ node-server tanpa WS | Chat & notifikasi pakai **polling** (pola sama dgn polling payment 5 detik), upgrade ke SSE/WS di fase lanjut |
| Design system | ✅ @nuxt/ui + Tailwind, palet slate/`#3358ff`, kartu `rounded-2xl` | Reuse, bikin `layouts/portal.vue` |
| Social media API | ❌ | Fase lanjut (butuh review app Meta/TikTok). MVP: **input metrik manual** oleh admin |

---

## 2–4. Struktur Database, Relasi & Migration

Detail kolom ada di file **`client-portal-migration.sql`**. Ringkasan tabel & relasi:

### Daftar tabel (prefix `portal_`)

| Tabel | Fungsi | Relasi utama |
|---|---|---|
| `portal_users` | Akun login (super_admin/admin/client) | `client_id` → `portal_clients` (khusus role client) |
| `portal_sessions` | Session aktif (revocable) | `user_id` → `portal_users` |
| `portal_clients` | Data perusahaan/brand klien | — |
| `portal_packages` | Paket SMM (Bronze/Silver/Gold) | — |
| `portal_subscriptions` | Langganan klien + status | `client_id`, `package_id` |
| `portal_briefs` | Brief campaign | `client_id`, `created_by` |
| `portal_contents` | Item kalender konten | `client_id`, `brief_id`, `created_by` |
| `portal_content_revisions` | Histori approve/reject/revisi | `content_id`, `user_id` |
| `portal_assets` | Asset library per klien | `client_id`, `folder_id`, `uploaded_by` |
| `portal_folders` | Folder asset | `client_id` |
| `portal_tickets` | Tiket support | `client_id`, `created_by` |
| `portal_ticket_messages` | Pesan dalam tiket | `ticket_id`, `user_id` |
| `portal_notes` | Catatan internal (admin-only) | polymorphic: `entity_type`+`entity_id` |
| `portal_social_accounts` | Akun sosmed terhubung | `client_id` |
| `portal_social_metrics` | Snapshot metrik harian | `client_id` |
| `portal_reports` | Laporan performa + PDF | `client_id`, `created_by` |
| `portal_invoices` | Invoice & status bayar | `client_id`, `created_by` |
| `portal_notifications` | Pusat notifikasi | `user_id` |
| `portal_chat_messages` | Chat client ↔ admin | `client_id`, `sender_user_id` |
| `portal_kb_articles` | Knowledge base | — |
| `portal_activity_logs` | Audit/activity log | `user_id` |

### Diagram relasi (ringkas)

```
portal_clients 1───* portal_users (role=client)
portal_clients 1───* portal_subscriptions *───1 portal_packages
portal_clients 1───* portal_briefs 1───* portal_contents 1───* portal_content_revisions
portal_clients 1───* portal_folders 1───* portal_assets
portal_clients 1───* portal_tickets 1───* portal_ticket_messages
portal_clients 1───* portal_invoices
portal_clients 1───* portal_social_accounts / portal_social_metrics / portal_reports / portal_chat_messages
portal_users   1───* portal_notifications / portal_sessions / portal_activity_logs
portal_notes   *───1 (client|brief|content|ticket)  [polymorphic]
```

Semua FK pakai `ON DELETE CASCADE` ke `portal_clients` agar hapus klien = bersih.

---

## 5. Daftar Halaman

### Area Client (`/client`, role: client)

| Route | Halaman |
|---|---|
| `/client/login` | Login portal |
| `/client/dashboard` | Dashboard ringkasan (paket, konten, approval, invoice, performa) |
| `/client/profile` | Profil perusahaan + brand + onboarding |
| `/client/briefs` · `/client/briefs/[id]` | List & detail/buat brief |
| `/client/calendar` | Content calendar (Monthly/Weekly/List) |
| `/client/approvals` · `/client/approvals/[id]` | Approval konten + revisi + timeline |
| `/client/assets` | Asset library |
| `/client/tickets` · `/client/tickets/[id]` | Support ticket |
| `/client/analytics` | Dashboard analitik sosmed |
| `/client/reports` | Laporan + download PDF |
| `/client/invoices` | Invoice + histori bayar |
| `/client/chat` | Chat dengan admin |
| `/client/knowledge-base` | FAQ & panduan |
| `/client/notifications` | Pusat notifikasi |

### Area Admin Portal (`/client/admin`, role: admin & super_admin)

| Route | Halaman |
|---|---|
| `/client/admin` | Login admin portal (atau shared dgn `/client/login`) |
| `/client/admin/dashboard` | Overview semua klien |
| `/client/admin/clients` · `/[id]` | Kelola klien + detail (brief, konten, invoice, notes per klien) |
| `/client/admin/calendar` | Kalender semua/ per klien — buat & jadwalkan konten |
| `/client/admin/approvals` | Pantau status approval |
| `/client/admin/tickets` | Kelola tiket |
| `/client/admin/invoices` | Buat & kirim invoice |
| `/client/admin/reports` | Generate laporan |
| `/client/admin/users` | Kelola user (super_admin only) |
| `/client/admin/packages` | Kelola paket (super_admin only) |
| `/client/admin/settings` · `/client/admin/logs` | Pengaturan & audit log (super_admin) |

Layout baru: `layouts/portal.vue` (sidebar desktop + bottom nav mobile, ikut pola `member.vue` yang sudah ada).

---

## 6. API / Route (`/api/portal/**`)

| Group | Endpoint contoh | Method |
|---|---|---|
| Auth | `/api/portal/auth/login`, `/logout`, `/me` | POST/GET |
| Clients | `/api/portal/clients` (list/create), `/clients/[id]` (get/update/delete) | GET/POST |
| Profile | `/api/portal/profile` (client self) | GET/POST |
| Briefs | `/api/portal/briefs`, `/briefs/[id]`, `/briefs/[id]/status` | GET/POST |
| Contents | `/api/portal/contents`, `/contents/[id]`, `/contents/[id]/status` | GET/POST |
| Approval | `/api/portal/contents/[id]/approve` · `/reject` · `/revise` | POST |
| Assets | `/api/portal/assets` (list/upload), `/assets/[id]` (delete), `/folders` | GET/POST |
| Tickets | `/api/portal/tickets`, `/tickets/[id]/messages`, `/tickets/[id]/status` | GET/POST |
| Notes | `/api/portal/notes` (admin only) | GET/POST |
| Analytics | `/api/portal/analytics`, `/social/connect`, `/social/metrics` | GET/POST |
| Reports | `/api/portal/reports`, `/reports/[id]/pdf` | GET/POST |
| Invoices | `/api/portal/invoices`, `/invoices/[id]`, `/invoices/[id]/pdf` | GET/POST |
| Notifications | `/api/portal/notifications`, `/notifications/read` | GET/POST |
| Chat | `/api/portal/chat/[clientId]` (list), `/chat/send`, `/chat/poll` | GET/POST |
| Knowledge base | `/api/portal/kb` | GET (admin: POST) |

Semua endpoint diawali middleware **`requirePortalUser`** + cek role/ownership (lihat §7).

---

## 7. RBAC — Matriks Permission

`S`=Super Admin · `A`=Admin · `C`=Client (hanya data sendiri)

| Modul | S | A | C |
|---|---|---|---|
| Lihat semua klien | ✅ | ✅ | ❌ (hanya diri) |
| Buat/edit/hapus klien | ✅ | ✅ | ❌ |
| Kelola user portal | ✅ | ❌ | ❌ |
| Kelola paket & setting sistem | ✅ | ❌ | ❌ |
| Audit logs | ✅ | view | ❌ |
| Buat/edit konten & kalender | ✅ | ✅ | ❌ (view) |
| Approve / reject / revisi konten | ❌ | ❌ | ✅ |
| Buat brief | ✅ | ✅ | ✅ (miliknya) |
| Ubah status brief + catatan | ✅ | ✅ | ❌ |
| Upload asset | ✅ | ✅ | ✅ (miliknya) |
| Internal notes | ✅ | ✅ | ❌ (tak terlihat) |
| Buat/kirim invoice | ✅ | ✅ | ❌ (view+bayar) |
| Generate report | ✅ | ✅ | ❌ (view+download) |
| Balas/kelola tiket | ✅ | ✅ | buat & balas miliknya |
| Chat | ✅ | ✅ | ✅ (dgn admin) |

**Enforcement (2 lapis):**
1. `requirePortalRole(event, ['admin','super_admin'])` — gate endpoint.
2. `assertClientOwnership(event, clientId)` — untuk role client, pastikan `clientId === session.client_id`. Wajib di **setiap** query data klien (anti IDOR).

---

## SECURITY checklist

- RBAC 2 lapis (role gate + ownership check) di semua endpoint.
- Session DB `portal_sessions` (token acak 32-byte, `expires_at`, bisa revoke) → cookie httpOnly `lakara_portal`.
- Rate limit di login & upload (reuse `rateLimit.ts`).
- Validasi upload: whitelist mime + max size + nama file di-sanitize, simpan di `NUXT_DATA_DIR` (bukan public), serve via endpoint ber-permission.
- `portal_activity_logs` untuk audit (login, CRUD penting, perubahan status, invoice).
- Internal notes hard-filter server-side (jangan pernah dikirim ke role client).
- Semua query klien wajib `WHERE client_id = ?` dari session, bukan dari body.

---

## ROADMAP BERFASE (rekomendasi build)

Bangun bertahap agar tiap fase **production-ready & teruji** sebelum lanjut.

| Fase | Isi | Hasil |
|---|---|---|
| **F1 — Fondasi** | Migration DB, auth portal + RBAC, `layouts/portal.vue`, seed paket, login, dashboard kerangka (client & admin), kelola user (super_admin) | Login multi-role jalan, akses ter-RBAC |
| **F2 — Core agency** | Client profile/onboarding, Brief management, Content calendar, Approval + Revision (limit per paket) | Alur kerja inti agency hidup |
| **F3 — Operasional** | Asset library, Ticket support, Internal notes, Notification center (polling) | Operasional lepas dari WhatsApp |
| **F4 — Komersial** | Billing & Invoice (+PDF, opsional Tripay), Reporting (+PDF) | Penagihan & laporan |
| **F5 — Growth** | Chat realtime, Analytics sosmed (manual → API), Knowledge base | Engagement & insight |

Tiap fase: build → uji → catat di Changelog `CLAUDE.md` (sesuai standar kita).

---

## STATUS IMPLEMENTASI

| Fase | Status |
|---|---|
| **F1 — Fondasi** | ✅ **SELESAI** (auth+RBAC, layout, login, dashboard client&admin, kelola klien & user portal) |
| **F2 — Core agency** | ✅ **SELESAI** — Client profile/onboarding, Brief, Content Calendar, Approval+Revisi (limit per paket) |
| F3 — Operasional | ⬜ belum |
| F4 — Komersial | ⬜ belum |
| F5 — Growth | ⬜ belum |

### File F2 yang sudah dibuat (sesi Juni 2026)
API: `server/api/portal/briefs/{index.get,index.post,[id].get}.ts`,
`server/api/portal/contents/{index.get,index.post,[id].get}.ts`,
`server/api/portal/contents/[id]/review.post.ts`.
Pages client: `pages/client/briefs/{index,[id]}.vue`, `pages/client/calendar.vue`, `pages/client/approvals/{index,[id]}.vue`.
Pages admin: `pages/client/admin/briefs/index.vue`, `pages/client/admin/calendar.vue`.
Profile/onboarding: `server/api/portal/profile/{index.get,index.post}.ts`, `pages/client/profile.vue` (+ banner onboarding di `pages/client/dashboard.vue`, nav "Profil" di `layouts/portal.vue`). Pakai kolom brand di `portal_clients` (brand_description, target_audience, competitor, tone_of_voice, business_goals, logo).
Helper baru: `composables/usePortalStatus.ts`, `components/PortalField.vue`,
`server/utils/db.ts` → `withTransaction()`, `server/utils/portal.ts` → `getClientRevisionLimit()`.
Nav F2 ditambahkan di `layouts/portal.vue`.

> **Tidak butuh migration baru** — tabel `portal_briefs`, `portal_contents`, `portal_content_revisions` sudah ada di `client-portal-migration.sql`.

**Alur konten:** admin buat (idea) → Kirim Approval (waiting_approval) → klien Setujui (approved) / Minta Revisi (designing, sesuai limit paket) → admin Jadwalkan (scheduled) → Tandai Tayang (published). Setiap aksi tercatat di timeline `portal_content_revisions`.

**Sisa F2:** Client profile/onboarding (`/client/profile`) — isi brand info (brand_description, target_audience, tone_of_voice, dll) yang kolomnya sudah ada di `portal_clients`.

File F1 yang sudah dibuat: `server/utils/portal.ts`, `composables/usePortal.ts`, `middleware/portal.ts`,
`layouts/portal.vue`, `server/api/portal/{auth/login,auth/logout,auth/me,clients/index.get,clients/index.post,users/index.get,users/index.post,packages/index.get,dashboard}.ts`,
`pages/client/{index,login}.vue`, `pages/client/dashboard.vue`, `pages/client/admin/{index,dashboard}.vue`,
`pages/client/admin/clients/index.vue`, `pages/client/admin/users/index.vue`.
`routeRules` `/client/**` sudah ditambahkan. Slug `client` sudah direservasi.

Login awal: `admin@lakara.id` / `Lakara@2024` (super admin dari seed).

## Catatan deploy
- Jalankan `client-portal-migration.sql` **sebelum** deploy build berisi kode portal.
- `routeRules: { '/client/**': { ssr: false } }` sudah ada di `nuxt.config.ts`.
- Build tetap **di Windows** (`npm run build`).
