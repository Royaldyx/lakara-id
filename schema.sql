-- Lakara MySQL Schema
-- Jalankan di phpMyAdmin → database: lakaraid_lakaracreative

CREATE TABLE IF NOT EXISTS stores (
  id             VARCHAR(20)  NOT NULL PRIMARY KEY,
  slug           VARCHAR(100) NOT NULL,
  name           VARCHAR(255) NOT NULL,
  tagline        VARCHAR(255) DEFAULT '',
  description    TEXT,
  logo           VARCHAR(500) DEFAULT '',
  primary_color  VARCHAR(7)   DEFAULT '#3358ff',
  active         TINYINT(1)   NOT NULL DEFAULT 1,
  member_active  TINYINT(1)   NOT NULL DEFAULT 1,
  member_email   VARCHAR(255) NOT NULL,
  member_password VARCHAR(64) NOT NULL,
  instagram      VARCHAR(255) DEFAULT '',
  tiktok         VARCHAR(255) DEFAULT '',
  whatsapp       VARCHAR(255) DEFAULT '',
  youtube        VARCHAR(255) DEFAULT '',
  why_buy        JSON,
  products       JSON,
  links_bio      JSON,
  product_tier   VARCHAR(20)  DEFAULT 'free',
  tier_started_at DATETIME    NULL,
  tier_expires_at DATETIME    NULL,
  created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_slug  (slug),
  UNIQUE KEY uk_email (member_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reset_tokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  token      VARCHAR(64)  NOT NULL,
  store_id   VARCHAR(20)  NOT NULL,
  email      VARCHAR(255) NOT NULL,
  expires_at DATETIME     NOT NULL,
  UNIQUE KEY uk_token    (token),
  INDEX      idx_store_id (store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pending_members (
  id            VARCHAR(20)  NOT NULL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(64)  NOT NULL,
  store_name    VARCHAR(255) NOT NULL,
  store_slug    VARCHAR(100) NOT NULL,
  description   TEXT,
  message       TEXT,
  status        VARCHAR(30)  DEFAULT 'auto_approved',
  reject_reason TEXT,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS upgrade_requests (
  id              VARCHAR(20)  NOT NULL PRIMARY KEY,
  store_id        VARCHAR(20)  NOT NULL,
  store_name      VARCHAR(255) NOT NULL,
  store_slug      VARCHAR(100) NOT NULL,
  tier_type       VARCHAR(20)  DEFAULT 'pro',
  note            TEXT,
  status          VARCHAR(30)  DEFAULT 'pending',
  approved_months INT          DEFAULT NULL,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_store_id (store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  `key`      VARCHAR(100) NOT NULL PRIMARY KEY,
  `value`    TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS newsletter (
  id         VARCHAR(20)  NOT NULL PRIMARY KEY,
  email      VARCHAR(255) NOT NULL,
  name       VARCHAR(255) DEFAULT '',
  source     VARCHAR(100) DEFAULT 'website',
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Tier upgrade: tambah tier_type ke upgrade_requests ───────────────────────
-- Jalankan sekali di server jika tabel sudah ada:
-- ALTER TABLE upgrade_requests ADD COLUMN IF NOT EXISTS tier_type VARCHAR(20) DEFAULT 'pro' AFTER store_slug;

-- ─── Tambah show_on_showcase ke stores ────────────────────────────────────────
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS show_on_showcase TINYINT(1) DEFAULT 0 AFTER links_bio;

-- ─── Tambah product_image_ratio ke stores (rasio gambar produk: '1:1' / '3:4') ──
-- WAJIB jalankan sekali di phpMyAdmin sebelum deploy update ini:
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS product_image_ratio VARCHAR(10) DEFAULT '1:1' AFTER show_on_showcase;

CREATE TABLE IF NOT EXISTS faqs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  question   VARCHAR(500) NOT NULL,
  answer     TEXT         NOT NULL,
  sort_order INT          DEFAULT 0,
  active     TINYINT(1)  DEFAULT 1,
  created_at DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS testimonials (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  role       VARCHAR(255) DEFAULT '',
  text       TEXT         NOT NULL,
  rating     TINYINT(1)  DEFAULT 5,
  avatar     VARCHAR(500) DEFAULT '',
  active     TINYINT(1)  DEFAULT 1,
  sort_order INT          DEFAULT 0,
  created_at DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default FAQs (jalankan setelah CREATE TABLE faqs)
INSERT IGNORE INTO faqs (question, answer, sort_order) VALUES
('Apa itu Lakara?', 'Lakara adalah platform digital all-in-one dari PT Lakara Solusi Kreatif. Tersedia fitur Link Bio (shortlink dengan multiple link), Storefront (toko online sederhana), dan layanan digital marketing, esports talent, serta web development.', 1),
('Apakah Lakara gratis?', 'Ya! Kamu bisa daftar dan menggunakan fitur dasar sepenuhnya gratis — termasuk Link Bio dengan hingga 5 link dan Storefront dengan hingga 10 produk. Upgrade ke Pro (Rp 9.000/bulan) atau Premium (Rp 35.000/bulan) untuk fitur lebih lengkap.', 2),
('Bagaimana cara daftar di Lakara?', 'Klik tombol "Daftar" di pojok kanan atas, isi nama toko dan email, lalu buat password. Akunmu langsung aktif dan kamu sudah punya halaman lakara.id/namamu.', 3),
('Apa perbedaan tier Free, Pro, dan Premium?', 'Free: 5 link, tampilan default, 10 produk. Pro (Rp 9.000/bulan): link tak terbatas, custom card style, analytics klik, produk unlimited. Premium (Rp 35.000/bulan): semua fitur Pro + hapus branding Lakara + analytics harian.', 4),
('Bagaimana cara upgrade ke Pro atau Premium?', 'Masuk ke dashboard member → klik menu Upgrade → pilih paket → transfer sesuai nominal ke rekening yang tertera → kirim request. Admin akan mengaktifkan dalam 1×24 jam setelah pembayaran dikonfirmasi.', 5),
('Bisakah saya menggunakan Lakara untuk jualan?', 'Tentu! Fitur Storefront memungkinkan kamu membuat halaman katalog produk di lakara.id/namamu/store. Lengkap dengan foto produk, deskripsi, harga, dan tautan ke marketplace seperti Shopee/Tokopedia.', 6),
('Apakah Lakara menerima proyek web/app custom?', 'Ya. Lakara Creative menerima proyek website, web app, mobile app, desain UI/UX, video animasi, dan embedded system. Konsultasi gratis via WhatsApp untuk estimasi harga dan timeline.', 7),
('Bagaimana cara menghubungi tim Lakara?', 'Kamu bisa WhatsApp kami, kirim email, atau isi form kontak di website. Kami merespons dalam 1–24 jam kerja.', 8);

-- Default Testimonials
INSERT IGNORE INTO testimonials (name, role, text, rating, sort_order) VALUES
('Owner, Brand Fashion Lokal', 'Fashion & Retail', 'Website baru kami jauh lebih cepat dan konversinya naik signifikan. Tim Lakara responsif dan hasilnya melebihi ekspektasi.', 5, 1),
('Manager IT, Perusahaan Energi', 'Enterprise', 'Sistem dashboard yang dibangun Lakara sangat membantu monitoring operasional harian kami. Komunikasi lancar dari awal sampai akhir.', 5, 2),
('Founder, Startup Kuliner', 'F&B / UMKM', 'Aplikasi kasir dari Lakara sudah dipakai di semua cabang kami. Stabil, mudah dipakai karyawan, dan support-nya cepat kalau ada masalah.', 5, 3);

-- Default Upload Limits ke settings
INSERT IGNORE INTO settings (`key`, `value`) VALUES
('upload_limit_free', '512'),
('upload_limit_pro',  '2048');

CREATE TABLE IF NOT EXISTS link_clicks (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  store_id   VARCHAR(20)  NOT NULL,
  link_id    VARCHAR(50)  NOT NULL,
  clicked_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_store_id   (store_id),
  INDEX idx_link_id    (link_id),
  INDEX idx_clicked_at (clicked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
