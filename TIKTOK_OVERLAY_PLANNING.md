# Planning — TikTok Live Overlay System (à la Tikfinity)

> Project TERPISAH dari Lakara.id. Stack sengaja disamain ke Nuxt (biar 1 skillset),
> KECUALI bagian real-time & deploy yang memang harus beda (sifat aplikasinya beda).
> Paste file ini di sesi baru sebagai konteks & roadmap.

---

## 0. Tujuan
Sistem overlay untuk TikTok Live (mirip Tikfinity): tangkap event live (gift, chat, follow, like, viewer, share) → broadcast real-time → tampil sebagai **browser source di OBS**. Ada **dashboard** buat connect username + kustomisasi overlay.

---

## 1. Stack (unified — sebisa mungkin sama Lakara)

| Layer | Teknologi | Sama dgn Lakara? |
|---|---|---|
| Framework | **Nuxt 3 (Vue 3 + TypeScript)** | ✅ sama |
| UI Dashboard | **@nuxt/ui + Tailwind** | ✅ sama |
| Overlay pages | **Nuxt pages** (bg transparan utk OBS) | ✅ sama |
| Server/Backend | **Nitro** (server engine bawaan Nuxt) | ✅ sama (Node.js) |
| Database | **MySQL** (mysql2) — simpan config overlay | ✅ sama (opsional) |
| **Real-time** | **WebSocket (Nitro `crossws`)** | 🔴 BEDA — Lakara pakai polling |
| **TikTok source** | **tiktok-live-connector** (npm) | 🔴 KHAS project ini |
| **Deploy** | **Railway / Render** (bukan cPanel!) | 🔴 BEDA — wajib |
| Build | di Linux (Railway) normal | 🔴 beda (Lakara "Windows only", itu kasus khusus) |

> **Kenapa deploy BUKAN cPanel:** app ini butuh proses persisten (nempel ke TikTok Live terus) + WebSocket stabil. cPanel/Passenger jelek buat itu (LVE limit, "Unable to fork"). Railway/Render dirancang buat long-running process + WS.

---

## 2. Arsitektur & flow

```
TikTok Live (username)
      │
      ▼
tiktok-live-connector  ──►  liveManager (singleton di Nitro)
   (1 koneksi/streamer)         │  simpan koneksi + reconnect
                                ▼
                        WebSocket (crossws)  ── publish per "topic" = username
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                        ▼
  Overlay: Gift Alert     Overlay: Goal Bar        Overlay: Leaderboard
  (OBS browser source)    (OBS browser source)     (OBS browser source)
        ▲
        └── Dashboard (Nuxt page) → connect/disconnect + atur setting overlay
```

Inti: **1 koneksi TikTok per streamer** → event di-broadcast ke **topic WS = username** → semua overlay yang subscribe topic itu update instan.

---

## 3. Struktur folder (Nuxt)

```
tiktok-overlay/
├── nuxt.config.ts            # aktifkan experimental.websocket
├── pages/
│   ├── index.vue             # landing / login (opsional)
│   ├── dashboard.vue         # config panel (connect username, atur overlay)
│   └── overlay/
│       ├── [username]/gift.vue        # overlay gift alert
│       ├── [username]/goal.vue        # goal bar
│       ├── [username]/leaderboard.vue # top gifters
│       ├── [username]/chat.vue        # live chat
│       ├── [username]/viewers.vue     # viewer counter
│       └── [username]/likes.vue       # like counter
├── server/
│   ├── plugins/live.ts        # inisialisasi liveManager saat server start
│   ├── utils/liveManager.ts   # kelola koneksi tiktok-live-connector + broadcast
│   ├── routes/_ws.ts          # WebSocket handler (crossws) — subscribe per username
│   └── api/
│       ├── connect.post.ts    # dashboard → mulai koneksi ke username
│       ├── disconnect.post.ts # stop koneksi
│       ├── status.get.ts      # status koneksi + viewer count
│       └── overlay/[id].ts    # get/save config overlay (kalau pakai DB)
├── composables/
│   └── useOverlaySocket.ts    # helper koneksi WS dari overlay page
└── assets/                    # animasi, sound default
```

---

## 4. Cara real-time (Nitro WebSocket / crossws)

**nuxt.config.ts** — aktifkan WS:
```ts
export default defineNuxtConfig({
  nitro: { experimental: { websocket: true } },
})
```

**server/routes/_ws.ts** — overlay subscribe ke topic = username:
```ts
export default defineWebSocketHandler({
  open(peer) { /* nanti di-subscribe pas terima pesan {join: username} */ },
  message(peer, msg) {
    const { join } = JSON.parse(msg.text())
    if (join) peer.subscribe(`live:${join}`)   // overlay masuk "room" username
  },
})
```

**server/utils/liveManager.ts** — koneksi TikTok + broadcast ke topic:
```ts
import { WebcastPushConnection } from 'tiktok-live-connector'
// simpan koneksi aktif: Map<username, connection>
// saat ada event (gift/chat/like/...), broadcast:
//   useNitroApp().hooks / crossws publish → ke topic `live:${username}`
// TODO: reconnect otomatis kalau putus, hapus koneksi kalau nggak ada overlay
```
> Cara publish dari luar ws-handler: pakai crossws global publish (simpan referensi peer/publisher), atau simpan registry peer per username lalu `peer.send()`. Detail implementasi di fase 1.

**Alternatif:** kalau pub/sub crossws kerasa ribet, boleh pakai **Socket.io** (rooms & reconnect lebih gampang) — tapi perlu attach ke node server Nitro (agak hacky) ATAU jalanin Socket.io sebagai service kecil terpisah. Buat MVP, coba crossws dulu.

---

## 5. Database (opsional, buat simpan config)
Kalau overlay bisa dikustomisasi & disimpan:
```
overlays (
  id, user_id, username_tiktok, type,   -- gift|goal|leaderboard|chat|viewers|likes
  config JSON,                          -- warna, font, animasi, threshold, sound_url
  created_at
)
users ( id, email, password_hash, ... ) -- kalau multi-user (auth mirip Lakara)
```
MVP boleh tanpa DB dulu (config via query param di URL overlay), tambah DB pas butuh simpan preset.

---

## 6. Roadmap berfase

### Fase 1 — Core Backend (real-time jalan)
- [ ] Setup Nuxt + aktifkan `nitro.experimental.websocket`
- [ ] Integrasi `tiktok-live-connector` di `liveManager`
- [ ] API `connect`/`disconnect` by username
- [ ] Listen event: gift, chat, follow, like, viewer count, share
- [ ] Broadcast semua event via WS ke topic `live:{username}`
- [ ] Tes: 1 overlay dummy nerima event real-time

### Fase 2 — Overlay Pages (OBS browser source)
Tiap overlay = URL unik `/overlay/{username}/{type}`, bg transparan.
- [ ] Gift Alert (animasi saat gift)
- [ ] Goal Bar (progress target diamond/gift)
- [ ] Top Gifters Leaderboard (ranking real-time)
- [ ] Chat Overlay (live chat)
- [ ] Viewer Counter
- [ ] Like Counter

### Fase 3 — Dashboard Config
- [ ] Input username → connect/disconnect + indikator status
- [ ] Kustomisasi tiap overlay (warna, font, animasi, threshold)
- [ ] Preview overlay sebelum dipasang
- [ ] Upload sound custom buat alert
- [ ] Generate URL overlay siap-copy ke OBS

### Fase 4 — Extra (opsional)
- [ ] TTS saat gift/chat
- [ ] Sound alert per jenis gift
- [ ] Combo gift tracker
- [ ] Countdown yang bisa di-extend viewer via gift
- [ ] Sub goals / milestone reward

---

## 7. Deploy (Railway / Render)
- [ ] Push ke GitHub → connect ke Railway
- [ ] Build command: `npm run build` · Start: `node .output/server/index.mjs`
- [ ] Set env var (kalau ada: DB, sign-server key, dll)
- [ ] Pastikan service tipe **web (persistent)**, bukan serverless (biar koneksi TikTok & WS hidup terus)
- [ ] MySQL: pakai plugin DB Railway (atau Postgres) kalau perlu simpan config

> URL overlay yang dikasih ke OBS = URL public Railway kamu, mis:
> `https://appmu.up.railway.app/overlay/username/gift`

---

## 8. Catatan penting & jebakan (baca sebelum ngoding)

1. **tiktok-live-connector butuh signing** — library ini pakai sign-server (Euler Stream) buat konek. Free tier ada limit request. Cek dokumentasi terbaru; siapin API key kalau perlu.
2. **Cuma jalan saat user LIVE** — kalau streamer nggak live, koneksi gagal/putus. Handle error & retry dengan sabar (jangan spam reconnect → bisa kena block).
3. **Reconnect & cleanup** — auto-reconnect kalau putus; tutup koneksi TikTok kalau nggak ada overlay yang subscribe (hemat resource).
4. **Rate limit / ToS** — ini akses tidak resmi ke TikTok. Pakai wajar, jangan agresif, siap kalau TikTok ubah sesuatu.
5. **1 app dulu (MVP), pisah kalau scale** — kalau nanti banyak streamer barengan, pisah jadi 2 service: (a) connector+WS, (b) web UI. Awal gabung aja.
6. **Overlay page = transparan** — set `body { background: transparent }`, di OBS centang "transparent background". Jangan ada layout/nav (beda dari halaman biasa) — pakai `definePageMeta({ layout: false })`.
7. **JANGAN deploy ke cPanel** (beda dari Lakara) — persistent WS + long connection nggak cocok di shared hosting.

---

## 9. Rekomendasi scope MVP (biar cepat kelihatan hasil)
Fokus dulu: **connect username → Gift Alert + Viewer Counter + Chat overlay** jalan real-time di OBS. Itu udah "wow" dan bisa dites live. Sisanya (goal bar, leaderboard, dashboard config, TTS) nyusul.

Urutan bikin: Fase 1 (backend + 1 overlay dummy) → Gift Alert → Chat → Viewer → baru Dashboard.
```
