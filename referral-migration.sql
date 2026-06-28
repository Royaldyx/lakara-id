-- ════════════════════════════════════════════════════════════
-- Referral System — member ajak teman, dua-duanya dapat +1 bulan Pro
-- Additive. Kode referral = slug toko (tidak perlu kolom baru utk kode).
-- ════════════════════════════════════════════════════════════

ALTER TABLE stores
  ADD COLUMN referred_by VARCHAR(20) NULL AFTER show_on_showcase,
  ADD COLUMN referral_rewarded TINYINT(1) NOT NULL DEFAULT 0 AFTER referred_by;

CREATE INDEX idx_referred_by ON stores (referred_by);
