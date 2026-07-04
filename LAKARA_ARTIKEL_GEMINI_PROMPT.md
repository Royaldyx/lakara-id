# Lakara.id — Kit Konten Artikel SEO (Prompt Gemini + Bank Ide)

> Tujuan: produksi artikel blog `lakara.id/artikel/{slug}` yang ranking di Google,
> menarik audiens Indonesia (kreator, UMKM, online seller, gamer/esports), dan
> mengarahkan pembaca ke produk Lakara (Link Bio + Toko Online) & jasa Lakara (SMM/branding).
>
> Cara pakai: (1) paste **Master Prompt** ke Gemini sekali. (2) Lalu kirim **Prompt Per-Artikel**
> dengan mengisi judul/slug/keyword dari **Bank Ide** di bawah. (3) Tempel hasilnya ke admin Lakara.

---

## 1. MASTER PROMPT (paste pertama kali di Gemini)

```
Kamu adalah content writer SEO senior untuk LAKARA.ID — platform digital all-in-one
asal Indonesia: Link Bio (mirip Linktree) + Toko Online gratis untuk kreator & UMKM,
juga punya divisi agency (social media management, branding, web development, esports).

AUDIENS: orang Indonesia — content creator pemula, UMKM/online seller, pengguna
Instagram/TikTok, gamer & esports enthusiast. Bahasa: Indonesia santai-profesional,
"kamu", mudah dicerna, praktis, banyak langkah konkret. Hindari bahasa kaku/akademis.

GAYA & ATURAN SEO:
- Fokus 1 keyword utama + 3-5 keyword turunan, sebar natural (jangan keyword stuffing).
- Keyword utama WAJIB muncul di: judul, paragraf pembuka (100 kata pertama), minimal 1 H2,
  dan di excerpt/meta description.
- Panjang 900-1500 kata. Kalimat pendek, paragraf max 3-4 baris.
- Struktur: pembuka yang relate dengan masalah pembaca → isi (H2/H3 actionable, langkah,
  list, contoh) → kesimpulan + ajakan halus pakai Lakara.
- Sertakan minimal 1 tabel ATAU 1 list bernomor (langkah-langkah).
- Tambahkan 3-5 pertanyaan FAQ singkat di akhir (format H3 pertanyaan + jawaban).
- Soft CTA ke Lakara di tengah & akhir (mis. "Kamu bisa langsung bikin link bio gratis di Lakara").
  Jangan hard-selling; utamakan nilai/edukasi.
- E-E-A-T: tulis seolah praktisi berpengalaman, beri tips spesifik & angka kalau relevan.

FORMAT OUTPUT (WAJIB persis, isi body pakai HTML):
---
TITLE: <judul ≤ 60 karakter, mengandung keyword utama>
SLUG: <kebab-case, pakai slug yang aku kasih>
CATEGORY: <salah satu: Link Bio | Jualan Online | Social Media | Branding | Esports | Monetisasi | Tips>
TAGS: <3-6 tag dipisah koma>
EXCERPT: <meta description 140-160 karakter, ada keyword utama, ada hook>
READ_TIME: <angka menit, mis. 6>
KEYWORDS: <keyword utama + turunan, dipisah koma>
CONTENT_HTML:
<konten artikel dalam HTML. HANYA pakai tag berikut (sudah ada style-nya di Lakara):
<h2>, <h3>, <p>, <ul><li>, <ol><li>, <strong>, <em>, <a href="">, <blockquote>,
<table><thead><tr><th></th></tr></thead><tbody><tr><td></td></tr></tbody></table>.
JANGAN pakai <h1> (judul sudah terpisah). JANGAN pakai inline style/class.>
---

Konfirmasi paham, lalu tunggu aku kirim judul + slug + keyword artikel pertama.
```

---

## 2. PROMPT PER-ARTIKEL (kirim setelah master prompt)

```
Tulis 1 artikel sesuai format. Detailnya:
- TITLE: <salin Judul dari Bank Ide>
- SLUG: <salin Slug>
- KEYWORD UTAMA: <salin Keyword>
- CATEGORY: <salin Kategori>
- ANGLE/INTENT: <salin kolom Intent — biar sudut tulisannya pas>
- Internal link: sisipkan 1-2 link ke artikel Lakara lain yang relevan
  (format <a href="/artikel/slug-lain">teks</a>) + 1 CTA ke /pricing atau ke link bio.
```

---

## 3. MAPPING KE FIELD ADMIN LAKARA

Saat input di Admin → Artikel, petakan output Gemini:

| Output Gemini | Field di Admin Lakara |
|---|---|
| TITLE | Judul |
| SLUG | Slug (URL: `lakara.id/artikel/{slug}`) |
| EXCERPT | Excerpt / Meta description |
| CATEGORY | Kategori |
| TAGS | Tags |
| READ_TIME | Read time (menit) |
| CONTENT_HTML | Konten (paste sebagai HTML — sudah cocok dengan style `.article-body`) |

> Catatan: cover image isi sendiri (boleh dari Unsplash/Canva). Setelah publish,
> minta re-index di Google Search Console biar cepat terindeks.

---

## 4. PILAR KONTEN (content pillars)

1. **Link Bio** — produk inti, keyword tertinggi nilai (orang cari "link bio", "alternatif linktree").
2. **Jualan Online / UMKM** — funnel ke Toko Online Lakara.
3. **Social Media Growth** — traffic besar, audiens kreator.
4. **Branding / Personal Branding** — nyambung ke jasa branding.
5. **Esports / Gaming** — niche khas Lakara/Royaldy, low competition.
6. **Monetisasi Kreator** — high intent, dekat ke konversi.
7. **Digital Marketing / Jasa** — funnel ke jasa agency Lakara.
8. **Tutorial Produk (bottom-funnel)** — pembaca siap pakai Lakara.

> Strategi: perbanyak pilar 1-3 (traffic), selipkan 5 (diferensiasi), tutup dengan 6-8 (konversi).

---

## 5. BANK IDE ARTIKEL (siap pakai)

### Pilar 1 — Link Bio
| Judul | Slug | Keyword utama | Intent |
|---|---|---|---|
| Cara Membuat Link Bio Gratis untuk Instagram (Panduan Lengkap) | cara-membuat-link-bio-gratis-instagram | cara membuat link bio | How-to pemula, langkah 1-2-3 |
| 7 Alternatif Linktree Terbaik untuk Kreator Indonesia | alternatif-linktree-terbaik-indonesia | alternatif linktree | Listicle perbandingan, Lakara di posisi unggul |
| Apa Itu Link Bio & Kenapa Penting untuk Bisnis Online | apa-itu-link-bio | apa itu link bio | Edukasi/definisi, awareness |
| 10 Contoh Link Bio Instagram yang Menarik & Profesional | contoh-link-bio-instagram-menarik | contoh link bio | Inspirasi + tips desain |
| Cara Pasang 1 Link Bio untuk Semua Sosial Media | satu-link-bio-untuk-semua-sosmed | link bio semua sosmed | Problem-solution |
| Link Bio vs Website: Mana yang Cocok untuk UMKM? | link-bio-vs-website-umkm | link bio vs website | Comparison, decision intent |

### Pilar 2 — Jualan Online / UMKM
| Judul | Slug | Keyword utama | Intent |
|---|---|---|---|
| Cara Jualan Online Tanpa Website (Cukup Modal HP) | cara-jualan-online-tanpa-website | jualan online tanpa website | How-to, funnel ke Toko Lakara |
| Cara Membuat Toko Online Gratis dalam 10 Menit | cara-membuat-toko-online-gratis | toko online gratis | How-to bottom-funnel |
| 9 Cara Dapat Pelanggan dari Instagram untuk Pemula | cara-dapat-pelanggan-dari-instagram | dapat pelanggan instagram | Tips actionable |
| Cara Jualan di TikTok Shop untuk Pemula 2026 | cara-jualan-tiktok-shop-pemula | jualan tiktok shop | How-to, tren |
| Tips Foto Produk Menarik Pakai HP untuk Online Shop | tips-foto-produk-pakai-hp | foto produk hp | Tips praktis |
| Cara Bikin Katalog Produk Online yang Memikat | cara-bikin-katalog-produk-online | katalog produk online | How-to + funnel Toko Lakara |

### Pilar 3 — Social Media Growth
| Judul | Slug | Keyword utama | Intent |
|---|---|---|---|
| 15 Ide Konten Instagram untuk Bisnis (Anti Bingung) | ide-konten-instagram-bisnis | ide konten instagram | Listicle, traffic tinggi |
| Jam Posting Terbaik di Instagram & TikTok 2026 | jam-posting-terbaik-instagram-tiktok | jam posting terbaik | Data/insight, evergreen |
| Cara Menambah Followers Instagram Secara Organik | cara-menambah-followers-instagram-organik | nambah followers instagram | How-to, anti-spam |
| Cara Bikin Konten TikTok yang FYP | cara-bikin-konten-tiktok-fyp | konten tiktok fyp | Tips algoritma |
| Content Calendar: 30 Hari Ide Konten untuk Online Shop | ide-konten-30-hari-online-shop | content calendar online shop | Template praktis (tabel) |
| Cara Bikin Caption Instagram yang Menjual | cara-bikin-caption-instagram-menjual | caption instagram menjual | Copywriting tips |

### Pilar 4 — Branding / Personal Branding
| Judul | Slug | Keyword utama | Intent |
|---|---|---|---|
| Cara Membangun Personal Branding di Media Sosial | cara-membangun-personal-branding | personal branding | Panduan, awareness |
| Cara Bikin Bio Instagram yang Menarik (+ Contoh) | cara-bikin-bio-instagram-menarik | bio instagram menarik | How-to + contoh |
| Panduan Personal Branding untuk Content Creator Pemula | personal-branding-content-creator-pemula | personal branding content creator | Niche, funnel jasa |

### Pilar 5 — Esports / Gaming (diferensiasi khas Lakara)
| Judul | Slug | Keyword utama | Intent |
|---|---|---|---|
| Cara Menjadi Caster / Shoutcaster Esports untuk Pemula | cara-menjadi-caster-esports-pemula | cara jadi caster esports | How-to niche, low competition |
| Karir di Industri Esports: Peluang & Cara Memulai | karir-industri-esports | karir esports | Career guide |
| Setup Streaming Murah untuk Pemula (Budget Terbatas) | setup-streaming-murah-pemula | setup streaming murah | Gear/how-to |
| Cara Jadi Content Creator Gaming dari Nol | cara-jadi-content-creator-gaming | content creator gaming | How-to |
| Cara Mengatur Event & Turnamen Esports | cara-mengatur-event-esports | event esports | Funnel jasa event Lakara |

### Pilar 6 — Monetisasi Kreator
| Judul | Slug | Keyword utama | Intent |
|---|---|---|---|
| 7 Cara Monetisasi Instagram untuk Kreator | cara-monetisasi-instagram | monetisasi instagram | High intent |
| Cara Dapat Uang dari TikTok untuk Pemula | cara-dapat-uang-dari-tiktok | uang dari tiktok | High intent |
| Apa Itu Affiliate Marketing & Cara Memulainya | apa-itu-affiliate-marketing | affiliate marketing | Edukasi + monetisasi |
| Cara Kreator Menghasilkan Uang dari Link Bio | cara-menghasilkan-uang-dari-link-bio | uang dari link bio | Funnel ke Lakara |

### Pilar 7 — Digital Marketing / Jasa Agency
| Judul | Slug | Keyword utama | Intent |
|---|---|---|---|
| Apa Itu Social Media Management & Manfaatnya untuk UMKM | apa-itu-social-media-management | social media management | Edukasi, funnel jasa |
| Cara Memilih Jasa Kelola Sosial Media yang Tepat | cara-memilih-jasa-kelola-sosmed | jasa kelola sosmed | Buyer guide |
| SEO untuk UMKM: Panduan Dasar agar Ditemukan di Google | seo-untuk-umkm-panduan-dasar | seo umkm | Edukasi |
| Kenapa Branding Penting untuk Bisnis Kecil | pentingnya-branding-bisnis-kecil | branding bisnis kecil | Awareness, funnel jasa |

### Pilar 8 — Tutorial Produk (bottom-funnel)
| Judul | Slug | Keyword utama | Intent |
|---|---|---|---|
| Cara Pakai QR Code Link Bio untuk Promosi Offline | cara-pakai-qr-code-link-bio | qr code link bio | Fitur, bottom-funnel |
| Cara Membuat Link Bio Lakara: Tutorial Lengkap | cara-membuat-link-bio-lakara | link bio lakara | Branded, konversi |
| Tips Optimasi Link Bio agar Banyak yang Klik | tips-optimasi-link-bio | optimasi link bio | Tips + fitur Lakara |

---

## 6. PRIORITAS PUBLISH (rekomendasi 30 hari pertama)

Mulai dari yang **traffic tinggi + dekat produk** dulu:

1. cara-membuat-link-bio-gratis-instagram
2. alternatif-linktree-terbaik-indonesia
3. cara-jualan-online-tanpa-website
4. ide-konten-instagram-bisnis
5. cara-membuat-toko-online-gratis
6. jam-posting-terbaik-instagram-tiktok
7. apa-itu-link-bio
8. cara-menambah-followers-instagram-organik

Lalu lanjut pilar Esports & Monetisasi untuk diferensiasi.
Target ritme: **2-3 artikel/minggu**, konsisten lebih penting daripada banyak sekaligus.

---

## 7. TIPS SEO SETELAH PUBLISH (checklist)

- [ ] Slug pendek & ada keyword (jangan ganti slug setelah terindeks — bikin link mati).
- [ ] Excerpt = meta description (140-160 char, ada keyword + hook).
- [ ] Internal link: tiap artikel link ke 1-2 artikel lain + 1 ke produk (`/pricing` / link bio).
- [ ] Cover image: kompres dulu (≤200KB), kasih nama file ber-keyword, isi alt text.
- [ ] Submit/Request Indexing di Google Search Console tiap habis publish.
- [ ] Update artikel lama tiap 3-6 bulan (Google suka konten fresh).
- [ ] Bagikan tiap artikel ke link bio Lakara + sosmed → sinyal traffic awal.

---

## 8. VARIASI PROMPT TAMBAHAN (opsional)

**Buat banyak judul sekaligus:**
```
Kasih aku 20 ide judul artikel SEO untuk Lakara.id di topik <TOPIK>, audiens Indonesia.
Tiap ide: Judul (≤60 char, ada keyword), Slug (kebab-case), Keyword utama, dan 1 kalimat angle.
Pilih keyword yang search intent-nya jelas dan kompetisinya nggak terlalu berat.
```

**Buat outline dulu sebelum full artikel:**
```
Buatkan outline artikel "<JUDUL>" (keyword: <KEYWORD>): daftar H2 & H3, poin tiap section,
dan ide tabel/list. Belum perlu paragraf penuh — outline dulu biar aku review.
```

**Repurpose artikel jadi konten sosmed:**
```
Dari artikel ini, buatkan: 1 caption Instagram (hook + nilai + CTA ke link bio),
5 slide carousel (judul tiap slide), dan 1 script Reels/TikTok 30 detik. Bahasa Indonesia santai.
```
```
