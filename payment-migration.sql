-- Lakara — Tripay Payment Migration (ALTER TABLE style)
-- Aman dijalankan berkali-kali (idempotent)
-- Jalankan di phpMyAdmin → database: lakaraid_lakaracreative

-- ─────────────────────────────────────────────────────────
-- STEP 1: Buat tabel payments (hanya kalau belum ada)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) NOT NULL PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────
-- STEP 2: Tambah kolom satu per satu (IF NOT EXISTS)
--         Aman diulang — tidak error kalau kolom sudah ada
-- ─────────────────────────────────────────────────────────

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS tripay_ref   VARCHAR(64)            DEFAULT NULL              COMMENT 'Reference dari Tripay (T0001...)',
  ADD COLUMN IF NOT EXISTS store_id     VARCHAR(20)            NOT NULL DEFAULT ''        COMMENT 'FK ke stores.id',
  ADD COLUMN IF NOT EXISTS tier_type    ENUM('pro','premium')  NOT NULL DEFAULT 'pro'     COMMENT 'Tier yang dibeli',
  ADD COLUMN IF NOT EXISTS months       INT                    NOT NULL DEFAULT 1         COMMENT 'Durasi langganan (bulan)',
  ADD COLUMN IF NOT EXISTS amount       INT                    NOT NULL DEFAULT 0         COMMENT 'Nominal dibayar customer (IDR)',
  ADD COLUMN IF NOT EXISTS method       VARCHAR(32)            DEFAULT NULL               COMMENT 'Kode channel: QRIS, BRIVA, BCAVA, DANA...',
  ADD COLUMN IF NOT EXISTS method_type  VARCHAR(16)            DEFAULT NULL               COMMENT 'direct | redirect',
  ADD COLUMN IF NOT EXISTS pay_code     VARCHAR(256)           DEFAULT NULL               COMMENT 'Nomor VA atau kode bayar',
  ADD COLUMN IF NOT EXISTS pay_url      TEXT                   DEFAULT NULL               COMMENT 'URL redirect e-wallet (DANA, ShopeePay)',
  ADD COLUMN IF NOT EXISTS checkout_url TEXT                   DEFAULT NULL               COMMENT 'URL checkout halaman Tripay',
  ADD COLUMN IF NOT EXISTS qr_url       TEXT                   DEFAULT NULL               COMMENT 'URL gambar QR (QRIS)',
  ADD COLUMN IF NOT EXISTS qr_string    TEXT                   DEFAULT NULL               COMMENT 'String raw QR (QRIS)',
  ADD COLUMN IF NOT EXISTS status       VARCHAR(16)            NOT NULL DEFAULT 'pending' COMMENT 'pending | paid | failed | expired',
  ADD COLUMN IF NOT EXISTS expired_at   DATETIME               DEFAULT NULL               COMMENT 'Batas waktu pembayaran',
  ADD COLUMN IF NOT EXISTS paid_at      DATETIME               DEFAULT NULL               COMMENT 'Waktu pembayaran sukses',
  ADD COLUMN IF NOT EXISTS created_at   DATETIME               NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at   DATETIME               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ─────────────────────────────────────────────────────────
-- STEP 3: Tambah index (IF NOT EXISTS — MySQL 8.0+)
--         Kalau pakai MySQL 5.7, skip bagian IF NOT EXISTS
--         dan jalankan manual hanya jika belum ada
-- ─────────────────────────────────────────────────────────

ALTER TABLE payments
  ADD INDEX IF NOT EXISTS idx_store      (store_id),
  ADD INDEX IF NOT EXISTS idx_tripay_ref (tripay_ref),
  ADD INDEX IF NOT EXISTS idx_status     (status);

-- ─────────────────────────────────────────────────────────
-- SELESAI. Verifikasi struktur tabel:
-- ─────────────────────────────────────────────────────────
-- DESCRIBE payments;
