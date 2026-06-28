-- ============================================================
-- CLIENT PORTAL F6 — Team & Freelancer
-- Jalankan SEKALI di phpMyAdmin / cPanel MySQL.
-- Additive: TIDAK mengubah tabel existing. Role staff/freelancer
-- pakai kolom portal_users.role yang sudah ada (VARCHAR).
-- ============================================================

-- 1. TASKS — tugas yang di-assign ke 1 orang (staff/freelancer)
CREATE TABLE IF NOT EXISTS portal_tasks (
  id           VARCHAR(20)  NOT NULL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  type         VARCHAR(20)  NOT NULL DEFAULT 'other',  -- design | writing | uiux | other
  assignee_id  VARCHAR(20)  DEFAULT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'todo',    -- todo | in_progress | submitted | revision | done
  deadline     DATE         DEFAULT NULL,
  fee          INT          NOT NULL DEFAULT 0,         -- 0 untuk staff (gaji bulanan)
  client_id    VARCHAR(20)  DEFAULT NULL,               -- konteks admin; TIDAK diekspos ke assignee
  content_id   VARCHAR(20)  DEFAULT NULL,
  deliverable  VARCHAR(500) DEFAULT NULL,               -- file hasil
  created_by   VARCHAR(20)  DEFAULT NULL,
  submitted_at DATETIME     DEFAULT NULL,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_task_assignee (assignee_id),
  INDEX idx_task_status (status),
  CONSTRAINT fk_task_assignee FOREIGN KEY (assignee_id) REFERENCES portal_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_task_client   FOREIGN KEY (client_id)   REFERENCES portal_clients(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TASK MESSAGES — diskusi/timeline per tugas (admin <-> assignee)
CREATE TABLE IF NOT EXISTS portal_task_messages (
  id         VARCHAR(20) NOT NULL PRIMARY KEY,
  task_id    VARCHAR(20) NOT NULL,
  user_id    VARCHAR(20) DEFAULT NULL,
  body       TEXT        NOT NULL,
  attachment VARCHAR(500) DEFAULT NULL,
  created_at DATETIME    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tmsg_task (task_id),
  CONSTRAINT fk_tmsg_task FOREIGN KEY (task_id) REFERENCES portal_tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. DAILY REPORTS — lapor harian (staff) [dipakai F6.2]
CREATE TABLE IF NOT EXISTS portal_daily_reports (
  id          VARCHAR(20) NOT NULL PRIMARY KEY,
  user_id     VARCHAR(20) NOT NULL,
  report_date DATE        NOT NULL,
  summary     TEXT        NOT NULL,
  hours       DECIMAL(4,1) DEFAULT 0,
  links       TEXT,
  created_at  DATETIME    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dr_user (user_id, report_date),
  CONSTRAINT fk_dr_user FOREIGN KEY (user_id) REFERENCES portal_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CONTRACTS — MOU/kontrak freelancer [dipakai F6.3]
CREATE TABLE IF NOT EXISTS portal_contracts (
  id         VARCHAR(20)  NOT NULL PRIMARY KEY,
  user_id    VARCHAR(20)  NOT NULL,
  title      VARCHAR(255) NOT NULL,
  file_path  VARCHAR(500) DEFAULT NULL,
  rate_type  VARCHAR(20)  DEFAULT 'per_task',  -- hourly | per_task | monthly
  rate       INT          DEFAULT 0,
  scope      TEXT,
  start_date DATE         DEFAULT NULL,
  end_date   DATE         DEFAULT NULL,
  status     VARCHAR(20)  DEFAULT 'active',     -- active | ended
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contract_user (user_id),
  CONSTRAINT fk_contract_user FOREIGN KEY (user_id) REFERENCES portal_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. PAYOUTS — pembayaran ke staff/freelancer [dipakai F6.3]
CREATE TABLE IF NOT EXISTS portal_payouts (
  id           VARCHAR(20) NOT NULL PRIMARY KEY,
  user_id      VARCHAR(20) NOT NULL,
  period_start DATE        DEFAULT NULL,
  period_end   DATE        DEFAULT NULL,
  amount       INT         NOT NULL DEFAULT 0,
  items        JSON        DEFAULT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | paid
  paid_at      DATETIME    DEFAULT NULL,
  notes        TEXT,
  created_by   VARCHAR(20) DEFAULT NULL,
  created_at   DATETIME    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payout_user (user_id),
  CONSTRAINT fk_payout_user FOREIGN KEY (user_id) REFERENCES portal_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
