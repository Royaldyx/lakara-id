-- ============================================================
-- CLIENT PORTAL — Migration
-- Jalankan SEKALI di phpMyAdmin / cPanel MySQL, sebelum deploy kode portal.
-- Semua tabel prefix `portal_`. TIDAK menyentuh tabel existing (stores, payments, dst).
-- Charset konsisten: utf8mb4_unicode_ci
-- ============================================================

-- ---------- 1. CLIENTS (perusahaan/brand) ----------
CREATE TABLE IF NOT EXISTS portal_clients (
  id               VARCHAR(20)  NOT NULL PRIMARY KEY,
  company_name     VARCHAR(255) NOT NULL,
  brand_name       VARCHAR(255) DEFAULT NULL,
  pic_name         VARCHAR(255) DEFAULT NULL,
  email            VARCHAR(255) DEFAULT NULL,
  whatsapp         VARCHAR(50)  DEFAULT NULL,
  website          VARCHAR(255) DEFAULT NULL,
  industry         VARCHAR(120) DEFAULT NULL,
  -- Brand information
  brand_description TEXT,
  target_audience   TEXT,
  competitor        TEXT,
  tone_of_voice     VARCHAR(255) DEFAULT NULL,
  business_goals    TEXT,
  logo             VARCHAR(500) DEFAULT NULL,
  status           VARCHAR(20)  NOT NULL DEFAULT 'active', -- active | paused | ended
  created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 2. USERS (login, RBAC) ----------
CREATE TABLE IF NOT EXISTS portal_users (
  id            VARCHAR(20)  NOT NULL PRIMARY KEY,
  role          VARCHAR(20)  NOT NULL DEFAULT 'client', -- super_admin | admin | client
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(64)  NOT NULL,
  phone         VARCHAR(50)  DEFAULT NULL,
  avatar        VARCHAR(500) DEFAULT NULL,
  client_id     VARCHAR(20)  DEFAULT NULL, -- diisi hanya untuk role 'client'
  active        TINYINT(1)   NOT NULL DEFAULT 1,
  last_login_at DATETIME     DEFAULT NULL,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_portal_user_email (email),
  INDEX idx_portal_user_role (role),
  INDEX idx_portal_user_client (client_id),
  CONSTRAINT fk_portal_user_client FOREIGN KEY (client_id)
    REFERENCES portal_clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 3. SESSIONS (revocable) ----------
CREATE TABLE IF NOT EXISTS portal_sessions (
  token      VARCHAR(64)  NOT NULL PRIMARY KEY,
  user_id    VARCHAR(20)  NOT NULL,
  ip         VARCHAR(64)  DEFAULT NULL,
  user_agent VARCHAR(255) DEFAULT NULL,
  expires_at DATETIME     NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_session_user (user_id),
  INDEX idx_portal_session_exp (expires_at),
  CONSTRAINT fk_portal_session_user FOREIGN KEY (user_id)
    REFERENCES portal_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 4. PACKAGES ----------
CREATE TABLE IF NOT EXISTS portal_packages (
  id             VARCHAR(20)  NOT NULL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,            -- Bronze | Silver | Gold
  price          INT          NOT NULL DEFAULT 0,
  content_quota  INT          NOT NULL DEFAULT 0,  -- konten/bulan
  revision_limit INT          NOT NULL DEFAULT 1,  -- revisi per konten
  features       JSON         DEFAULT NULL,
  active         TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order     INT          NOT NULL DEFAULT 0,
  created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 5. SUBSCRIPTIONS ----------
CREATE TABLE IF NOT EXISTS portal_subscriptions (
  id          VARCHAR(20) NOT NULL PRIMARY KEY,
  client_id   VARCHAR(20) NOT NULL,
  package_id  VARCHAR(20) NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'active', -- active | paused | ended
  start_date  DATE        DEFAULT NULL,
  end_date    DATE        DEFAULT NULL,
  revision_limit_override INT DEFAULT NULL,          -- opsional override paket
  created_at  DATETIME    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_sub_client (client_id),
  CONSTRAINT fk_portal_sub_client  FOREIGN KEY (client_id)  REFERENCES portal_clients(id)  ON DELETE CASCADE,
  CONSTRAINT fk_portal_sub_package FOREIGN KEY (package_id) REFERENCES portal_packages(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 6. FOLDERS (asset) ----------
CREATE TABLE IF NOT EXISTS portal_folders (
  id         VARCHAR(20)  NOT NULL PRIMARY KEY,
  client_id  VARCHAR(20)  NOT NULL,
  name       VARCHAR(120) NOT NULL,             -- Logo | Foto Produk | Video Produk | Brand Asset | Dokumen | custom
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_folder_client (client_id),
  CONSTRAINT fk_portal_folder_client FOREIGN KEY (client_id) REFERENCES portal_clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 7. ASSETS ----------
CREATE TABLE IF NOT EXISTS portal_assets (
  id          VARCHAR(20)  NOT NULL PRIMARY KEY,
  client_id   VARCHAR(20)  NOT NULL,
  folder_id   VARCHAR(20)  DEFAULT NULL,
  category    VARCHAR(50)  DEFAULT NULL,         -- fallback kalau tanpa folder
  name        VARCHAR(255) NOT NULL,
  file_path   VARCHAR(500) NOT NULL,
  mime        VARCHAR(120) DEFAULT NULL,
  size        INT          DEFAULT 0,
  uploaded_by VARCHAR(20)  DEFAULT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_asset_client (client_id),
  INDEX idx_portal_asset_folder (folder_id),
  CONSTRAINT fk_portal_asset_client FOREIGN KEY (client_id) REFERENCES portal_clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_portal_asset_folder FOREIGN KEY (folder_id) REFERENCES portal_folders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 8. BRIEFS ----------
CREATE TABLE IF NOT EXISTS portal_briefs (
  id          VARCHAR(20)  NOT NULL PRIMARY KEY,
  client_id   VARCHAR(20)  NOT NULL,
  title       VARCHAR(255) NOT NULL,
  objective   TEXT,
  description TEXT,
  promo       TEXT,
  cta         VARCHAR(255) DEFAULT NULL,
  deadline    DATE         DEFAULT NULL,
  reference   TEXT,                              -- referensi desain (link/teks)
  status      VARCHAR(20)  NOT NULL DEFAULT 'draft', -- draft | submitted | in_progress | completed
  created_by  VARCHAR(20)  DEFAULT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_portal_brief_client (client_id),
  INDEX idx_portal_brief_status (status),
  CONSTRAINT fk_portal_brief_client FOREIGN KEY (client_id) REFERENCES portal_clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 9. CONTENTS (calendar) ----------
CREATE TABLE IF NOT EXISTS portal_contents (
  id           VARCHAR(20)  NOT NULL PRIMARY KEY,
  client_id    VARCHAR(20)  NOT NULL,
  brief_id     VARCHAR(20)  DEFAULT NULL,
  title        VARCHAR(255) NOT NULL,
  type         VARCHAR(20)  NOT NULL DEFAULT 'feed', -- feed | carousel | reels | story
  status       VARCHAR(20)  NOT NULL DEFAULT 'idea', -- idea | designing | waiting_approval | approved | scheduled | published
  caption      TEXT,
  design_file  VARCHAR(500) DEFAULT NULL,         -- path desain/video utama
  scheduled_at DATETIME     DEFAULT NULL,
  published_at DATETIME     DEFAULT NULL,
  created_by   VARCHAR(20)  DEFAULT NULL,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_portal_content_client (client_id),
  INDEX idx_portal_content_status (status),
  INDEX idx_portal_content_sched (scheduled_at),
  CONSTRAINT fk_portal_content_client FOREIGN KEY (client_id) REFERENCES portal_clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_portal_content_brief  FOREIGN KEY (brief_id)  REFERENCES portal_briefs(id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 10. CONTENT REVISIONS (timeline approve/reject/revisi) ----------
CREATE TABLE IF NOT EXISTS portal_content_revisions (
  id         VARCHAR(20) NOT NULL PRIMARY KEY,
  content_id VARCHAR(20) NOT NULL,
  version    INT         NOT NULL DEFAULT 1,
  action     VARCHAR(30) NOT NULL,               -- uploaded | approved | rejected | revision_requested
  reason     TEXT,                               -- wajib untuk revision_requested
  user_id    VARCHAR(20) DEFAULT NULL,
  created_at DATETIME    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_rev_content (content_id),
  CONSTRAINT fk_portal_rev_content FOREIGN KEY (content_id) REFERENCES portal_contents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 11. TICKETS ----------
CREATE TABLE IF NOT EXISTS portal_tickets (
  id         VARCHAR(20)  NOT NULL PRIMARY KEY,
  client_id  VARCHAR(20)  NOT NULL,
  subject    VARCHAR(255) NOT NULL,
  category   VARCHAR(30)  NOT NULL DEFAULT 'general', -- revision | billing | technical | general
  status     VARCHAR(20)  NOT NULL DEFAULT 'open',    -- open | in_progress | waiting_client | closed
  created_by VARCHAR(20)  DEFAULT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_portal_ticket_client (client_id),
  INDEX idx_portal_ticket_status (status),
  CONSTRAINT fk_portal_ticket_client FOREIGN KEY (client_id) REFERENCES portal_clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portal_ticket_messages (
  id          VARCHAR(20) NOT NULL PRIMARY KEY,
  ticket_id   VARCHAR(20) NOT NULL,
  user_id     VARCHAR(20) DEFAULT NULL,
  message     TEXT        NOT NULL,
  attachment  VARCHAR(500) DEFAULT NULL,
  created_at  DATETIME    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_tmsg_ticket (ticket_id),
  CONSTRAINT fk_portal_tmsg_ticket FOREIGN KEY (ticket_id) REFERENCES portal_tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 12. INTERNAL NOTES (admin-only, polymorphic) ----------
CREATE TABLE IF NOT EXISTS portal_notes (
  id          VARCHAR(20) NOT NULL PRIMARY KEY,
  entity_type VARCHAR(20) NOT NULL,              -- client | brief | content | ticket
  entity_id   VARCHAR(20) NOT NULL,
  body        TEXT        NOT NULL,
  created_by  VARCHAR(20) DEFAULT NULL,
  created_at  DATETIME    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_note_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 13. SOCIAL ACCOUNTS & METRICS ----------
CREATE TABLE IF NOT EXISTS portal_social_accounts (
  id           VARCHAR(20)  NOT NULL PRIMARY KEY,
  client_id    VARCHAR(20)  NOT NULL,
  platform     VARCHAR(20)  NOT NULL,            -- instagram | facebook | tiktok
  handle       VARCHAR(120) DEFAULT NULL,
  access_token TEXT,                             -- terenkripsi saat integrasi API (fase lanjut)
  connected    TINYINT(1)   NOT NULL DEFAULT 0,
  expires_at   DATETIME     DEFAULT NULL,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_social_client (client_id),
  CONSTRAINT fk_portal_social_client FOREIGN KEY (client_id) REFERENCES portal_clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portal_social_metrics (
  id              VARCHAR(20) NOT NULL PRIMARY KEY,
  client_id       VARCHAR(20) NOT NULL,
  platform        VARCHAR(20) NOT NULL,
  metric_date     DATE        NOT NULL,
  followers       INT         DEFAULT 0,
  reach           INT         DEFAULT 0,
  impressions     INT         DEFAULT 0,
  profile_visits  INT         DEFAULT 0,
  engagement_rate DECIMAL(6,2) DEFAULT 0,
  created_at      DATETIME    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_metric_client (client_id, metric_date),
  CONSTRAINT fk_portal_metric_client FOREIGN KEY (client_id) REFERENCES portal_clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 14. REPORTS ----------
CREATE TABLE IF NOT EXISTS portal_reports (
  id           VARCHAR(20)  NOT NULL PRIMARY KEY,
  client_id    VARCHAR(20)  NOT NULL,
  title        VARCHAR(255) NOT NULL,
  period_start DATE         DEFAULT NULL,
  period_end   DATE         DEFAULT NULL,
  summary      TEXT,
  kpi          JSON         DEFAULT NULL,
  insight      TEXT,
  recommendation TEXT,
  file_path    VARCHAR(500) DEFAULT NULL,        -- PDF hasil generate
  created_by   VARCHAR(20)  DEFAULT NULL,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_report_client (client_id),
  CONSTRAINT fk_portal_report_client FOREIGN KEY (client_id) REFERENCES portal_clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 15. INVOICES ----------
CREATE TABLE IF NOT EXISTS portal_invoices (
  id             VARCHAR(20)  NOT NULL PRIMARY KEY,
  invoice_number VARCHAR(50)  NOT NULL,
  client_id      VARCHAR(20)  NOT NULL,
  amount         INT          NOT NULL DEFAULT 0,
  items          JSON         DEFAULT NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'unpaid', -- paid | unpaid | overdue
  issued_date    DATE         DEFAULT NULL,
  due_date       DATE         DEFAULT NULL,
  paid_at        DATETIME     DEFAULT NULL,
  notes          TEXT,
  created_by     VARCHAR(20)  DEFAULT NULL,
  created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_portal_invoice_number (invoice_number),
  INDEX idx_portal_invoice_client (client_id),
  INDEX idx_portal_invoice_status (status),
  CONSTRAINT fk_portal_invoice_client FOREIGN KEY (client_id) REFERENCES portal_clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 16. NOTIFICATIONS ----------
CREATE TABLE IF NOT EXISTS portal_notifications (
  id         VARCHAR(20)  NOT NULL PRIMARY KEY,
  user_id    VARCHAR(20)  NOT NULL,
  type       VARCHAR(40)  DEFAULT NULL,          -- content_approval | revision_done | ticket_reply | invoice | brief_update | status_change
  title      VARCHAR(255) NOT NULL,
  body       TEXT,
  link       VARCHAR(255) DEFAULT NULL,
  read_at    DATETIME     DEFAULT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_notif_user (user_id, read_at),
  CONSTRAINT fk_portal_notif_user FOREIGN KEY (user_id) REFERENCES portal_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 17. CHAT ----------
CREATE TABLE IF NOT EXISTS portal_chat_messages (
  id             VARCHAR(20)  NOT NULL PRIMARY KEY,
  client_id      VARCHAR(20)  NOT NULL,          -- thread = per klien
  sender_user_id VARCHAR(20)  DEFAULT NULL,
  sender_role    VARCHAR(20)  DEFAULT NULL,      -- client | admin | super_admin
  body           TEXT,
  attachment     VARCHAR(500) DEFAULT NULL,
  read_at        DATETIME     DEFAULT NULL,
  created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_chat_client (client_id, created_at),
  CONSTRAINT fk_portal_chat_client FOREIGN KEY (client_id) REFERENCES portal_clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 18. KNOWLEDGE BASE ----------
CREATE TABLE IF NOT EXISTS portal_kb_articles (
  id         VARCHAR(20)  NOT NULL PRIMARY KEY,
  category   VARCHAR(40)  NOT NULL DEFAULT 'faq', -- faq | tutorial | guide
  title      VARCHAR(255) NOT NULL,
  slug       VARCHAR(160) NOT NULL,
  body       MEDIUMTEXT,
  sort_order INT          NOT NULL DEFAULT 0,
  published  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_portal_kb_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 19. ACTIVITY / AUDIT LOGS ----------
CREATE TABLE IF NOT EXISTS portal_activity_logs (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(20)  DEFAULT NULL,
  role        VARCHAR(20)  DEFAULT NULL,
  action      VARCHAR(80)  NOT NULL,             -- login | create_brief | approve_content | send_invoice | ...
  entity_type VARCHAR(30)  DEFAULT NULL,
  entity_id   VARCHAR(20)  DEFAULT NULL,
  meta        JSON         DEFAULT NULL,
  ip          VARCHAR(64)  DEFAULT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_log_user (user_id),
  INDEX idx_portal_log_entity (entity_type, entity_id),
  INDEX idx_portal_log_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED awal: paket + super admin pertama
-- GANTI email & password hash super admin sebelum produksi.
-- password_hash = SHA-256( password + 'lakara_salt' )  (sama dgn hashPassword existing)
-- ============================================================
INSERT INTO portal_packages (id, name, price, content_quota, revision_limit, sort_order) VALUES
  ('pkg_bronze', 'Bronze', 1500000, 12, 1, 1),
  ('pkg_silver', 'Silver', 2500000, 16, 2, 2),
  ('pkg_gold',   'Gold',   4000000, 24, 3, 3)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Super admin awal. Login: admin@lakara.id  /  password: Lakara@2024
-- SHA2(CONCAT(pass,'lakara_salt'),256) di MySQL == hashPassword() di aplikasi.
-- WAJIB: ganti password setelah login pertama (atau ubah string di bawah sebelum run).
INSERT INTO portal_users (id, role, name, email, password_hash, active)
VALUES ('usr_superadmin', 'super_admin', 'Super Admin Lakara', 'admin@lakara.id',
        SHA2(CONCAT('Lakara@2024', 'lakara_salt'), 256), 1)
ON DUPLICATE KEY UPDATE role = VALUES(role);
