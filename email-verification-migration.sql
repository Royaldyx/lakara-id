-- ============================================================
-- Email Verification Migration — jalankan SEKALI di phpMyAdmin / cPanel MySQL
-- Setelah schema.sql & payment-migration.sql
-- ============================================================

-- 1. Kolom penanda email terverifikasi di tabel stores
ALTER TABLE stores
  ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0;

-- 2. Tandai SEMUA akun yang sudah ada sebagai terverifikasi
--    (biar member lama tidak terkunci saat login)
UPDATE stores SET email_verified = 1;

-- 3. Tabel token verifikasi email
CREATE TABLE IF NOT EXISTS email_verifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  token      VARCHAR(64)  NOT NULL,
  store_id   VARCHAR(20)  NOT NULL,
  email      VARCHAR(255) NOT NULL,
  expires_at DATETIME     NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_ev_token (token),
  INDEX      idx_ev_store (store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
