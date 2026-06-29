-- ============================================================
-- ANALYTICS ENRICH — Migration
-- Tambah kolom traffic source (referrer) + device ke link_clicks.
-- Jalankan SEKALI di phpMyAdmin / cPanel MySQL.
-- Additive — tidak mengubah data existing. Peak-hours diturunkan dari clicked_at (tanpa kolom).
-- ============================================================

ALTER TABLE link_clicks
  ADD COLUMN IF NOT EXISTS referrer VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS device   VARCHAR(20)  DEFAULT NULL;

-- Index opsional untuk agregasi lebih cepat (boleh di-skip kalau tabel kecil)
-- CREATE INDEX idx_link_clicks_referrer ON link_clicks (store_id, referrer);
-- CREATE INDEX idx_link_clicks_device   ON link_clicks (store_id, device);
