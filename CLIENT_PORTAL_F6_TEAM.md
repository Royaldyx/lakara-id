# F6 — Team & Freelancer Module (Arsitektur)

> Perluasan Client Portal: **staff internal** & **freelancer** (desain grafis, content writing, UI/UX) masuk ke portal yang sama.
> Prinsip: **gabung, bukan web baru**. Reuse auth/RBAC/notifikasi/chat/asset yang sudah ada.
> Keputusan kunci: **assignment per-TUGAS**, bukan ditempel ke klien tertentu.

---

## 0. Prinsip & keputusan

| Hal | Keputusan |
|---|---|
| Identitas | `staff` & `freelancer` = role baru di `portal_users` (kolom `role` sudah VARCHAR, tinggal izinkan value baru — **tanpa ubah skema users**) |
| Assignment | Per-tugas. Tabel `portal_tasks` punya `assignee_id`. Privasi otomatis: scope `WHERE assignee_id = session.user.id` |
| Privasi data klien | Assignee TIDAK lihat data klien. Tugas boleh nyimpen `client_id` (konteks admin) tapi tidak diekspos ke assignee |
| Arah uang | Invoice klien = uang MASUK (sudah ada). **Payout** staff/freelancer = uang KELUAR → tabel terpisah `portal_payouts` |
| Auth | Reuse `lakara_portal` + `portal_sessions`. Tidak ada sistem login baru |

---

## 1. Tabel baru (prefix `portal_`)

> Tidak ada perubahan tabel existing. `portal_users.role` cukup diizinkan nilai `staff`/`freelancer` di level aplikasi.

| Tabel | Fungsi | Relasi |
|---|---|---|
| `portal_tasks` | Tugas yang di-assign ke 1 orang | `assignee_id`→users, `client_id`?→clients, `content_id`?→contents, `created_by` |
| `portal_task_messages` | Diskusi/timeline per tugas (admin ↔ assignee) | `task_id`, `user_id` |
| `portal_daily_reports` | Lapor harian (staff) | `user_id` |
| `portal_contracts` | MOU/kontrak freelancer (rate, scope, file) | `user_id` |
| `portal_payouts` | Pembayaran ke staff/freelancer | `user_id`, items JSON (task_id+fee) |

### Kolom inti

**portal_tasks**
```
id, title, description, type (design|writing|uiux|other),
assignee_id, status (todo|in_progress|submitted|revision|done),
deadline DATE, fee INT (0 untuk staff/gaji-bulanan),
client_id NULL, content_id NULL, deliverable VARCHAR(500) NULL,
created_by, created_at, updated_at, submitted_at NULL
```

**portal_daily_reports**
```
id, user_id, report_date DATE, summary TEXT, hours DECIMAL(4,1),
links TEXT, created_at   (UNIQUE user_id+report_date opsional)
```

**portal_contracts**
```
id, user_id, title, file_path, rate_type (hourly|per_task|monthly),
rate INT, scope TEXT, start_date, end_date, status (active|ended), created_at
```

**portal_payouts**
```
id, user_id, period_start, period_end, amount INT, items JSON,
status (pending|paid), paid_at, notes, created_by, created_at
```

Semua FK ke `portal_users(id)` pakai `ON DELETE CASCADE`.

---

## 2. RBAC — Matriks 5 role

`S`=super_admin · `A`=admin · `C`=client · `St`=staff · `Fr`=freelancer

| Aksi | S | A | C | St | Fr |
|---|---|---|---|---|---|
| Buat/assign tugas | ✅ | ✅ | ❌ | ❌ | ❌ |
| Lihat **semua** tugas | ✅ | ✅ | ❌ | ❌ | ❌ |
| Lihat **tugas sendiri** (assignee) | ✅ | ✅ | ❌ | ✅ | ✅ |
| Upload deliverable + submit | ❌ | ❌ | ❌ | ✅ | ✅ |
| Review/approve/minta revisi tugas | ✅ | ✅ | ❌ | ❌ | ❌ |
| Daily report (isi) | ➖ | ➖ | ❌ | ✅ | ➖ |
| Lihat rekap daily report semua | ✅ | ✅ | ❌ | ❌ | ❌ |
| Kelola user team (staff/freelancer) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Lihat MOU/kontrak sendiri | ❌ | ❌ | ❌ | ➖ | ✅ |
| Kelola kontrak & payout | ✅ | ✅ | ❌ | ❌ | ❌ |
| Lihat payout sendiri | ❌ | ❌ | ❌ | ✅ | ✅ |
| Data klien lengkap | ✅ | ✅ | sendiri | ❌ | ❌ |

**Enforcement:** endpoint tugas team pakai `WHERE assignee_id = user.id` untuk role staff/freelancer. Endpoint kontrak/payout pakai `WHERE user_id = user.id`. Admin lolos (lihat semua). → privasi antar-freelancer otomatis.

---

## 3. Halaman

### Area Team (role staff/freelancer) — di bawah `/client`
| Route | Isi |
|---|---|
| `/client/tasks` | "Tugas Saya" (board/list per status) |
| `/client/tasks/[id]` | Detail tugas: brief, deadline, upload deliverable, submit, diskusi |
| `/client/daily-report` | Isi & riwayat lapor harian (staff) |
| `/client/my-contract` | MOU/kontrak + rate (freelancer) |
| `/client/my-payouts` | Riwayat & status pembayaran ke dia |

> Landing setelah login: staff/freelancer → `/client/tasks` (bukan dashboard klien).

### Area Admin — `/client/admin`
| Route | Isi |
|---|---|
| `/client/admin/tasks` | Kelola semua tugas + assign + status (board) |
| `/client/admin/team` | Kelola user staff & freelancer |
| `/client/admin/daily-reports` | Rekap lapor harian semua staff (filter tanggal/orang) |
| `/client/admin/contracts` | Kelola MOU/kontrak freelancer |
| `/client/admin/payouts` | Buat payout (auto-sum tugas selesai per orang) + tandai dibayar |

---

## 4. API (`/api/portal/**`)

| Group | Endpoint | Method |
|---|---|---|
| Tasks | `tasks` (GET scoped/admin-all, POST admin create) | GET/POST |
| | `tasks/[id]` (GET ownership), `tasks/[id]/submit` (assignee upload), `tasks/[id]/status` (admin), `tasks/[id]/message` | GET/POST |
| Daily report | `daily-reports` (GET self/admin-all, POST self) | GET/POST |
| Contracts | `contracts` (GET self/admin-all, POST admin), `contracts/[id]` | GET/POST |
| Payouts | `payouts` (GET self/admin-all, POST admin create), `payouts/[id]/status` (admin: paid) | GET/POST |
| Team users | extend `users` (tambah action create staff/freelancer) atau endpoint `team` | GET/POST |

Notifikasi (reuse `notify()`): assign tugas → notif assignee; submit deliverable → notif admin; revisi/approve → notif assignee; payout dibuat → notif penerima.

---

## 5. Integrasi ke kode existing (yang perlu disentuh)

1. `usePortal` / `middleware/portal.ts` — tambah handling role staff/freelancer: arahkan ke `/client/tasks`, blok dari area admin & halaman khusus klien (dashboard/invoices/briefs/approvals).
2. `layouts/portal.vue` — nav set baru untuk role team (Tugas, Daily Report, Kontrak, Payout).
3. `server/api/portal/users` — izinkan buat akun role `staff`/`freelancer`.
4. (Opsional) `portal_contents` — tambah relasi ke task biar konten bisa diturunkan jadi tugas produksi.

Tidak ada perubahan pada modul klien (F1–F5) — murni penambahan.

---

## 6. Roadmap F6 (bertahap)

| Fase | Isi | Hasil |
|---|---|---|
| **F6.1 — Core** | Role staff/freelancer, kelola user team, Task CRUD + assign, "Tugas Saya", upload deliverable + submit, admin review/approve/revisi, notifikasi | Alur kerja tugas hidup end-to-end |
| **F6.2 — Daily Report** | Isi lapor harian (staff) + rekap admin | Tracking aktivitas harian |
| **F6.3 — Kontrak & Payout** | MOU/kontrak freelancer, payout (auto-sum fee tugas selesai), tandai dibayar | Administrasi freelancer & keuangan keluar |

Tiap fase: build → uji → catat di Changelog `CLAUDE.md`.

---

## 7. Catatan deploy
- Butuh **1 migration baru**: `client-portal-f6-migration.sql` (5 tabel di atas). Tidak ada perubahan tabel existing.
- Build tetap **di Windows** (`npm run build`).
- `app.vue` `SITE_PREFIXES` sudah punya `/client` — tidak perlu diubah.
