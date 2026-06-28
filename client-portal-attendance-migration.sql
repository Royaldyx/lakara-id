-- ════════════════════════════════════════════════════════════
-- Client Portal — Absensi Manual (F6.4)
-- Jalankan SETELAH client-portal-f6-migration.sql
-- Additive: tidak mengubah tabel existing.
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS portal_attendance (
  id         VARCHAR(20)  NOT NULL,
  user_id    VARCHAR(20)  NOT NULL,
  `date`     DATE         NOT NULL,
  status     VARCHAR(20)  NOT NULL DEFAULT 'hadir',  -- hadir | izin | sakit | alpha | libur
  note       VARCHAR(255) DEFAULT NULL,
  created_by VARCHAR(20)  DEFAULT NULL,              -- admin yang input
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_date (user_id, `date`),
  KEY idx_user (user_id),
  KEY idx_date (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
