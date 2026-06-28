#!/bin/bash
# ════════════════════════════════════════════════════════════
# Backup DB Lakara — mysqldump harian + auto-hapus backup lama
# Pasang di cPanel → Cron Jobs (lihat instruksi di bawah).
# ════════════════════════════════════════════════════════════

# ── KONFIGURASI (isi sesuai akun cPanel kamu) ──
DB_USER="lakaraid_user"
DB_PASS="GANTI_PASSWORD_DB"
DB_NAME="lakaraid_lakaracreative"
DB_HOST="localhost"

# Folder simpan backup (DI LUAR public_html biar tidak bisa diakses publik!)
BACKUP_DIR="/home/lakaraid/db-backups"

# Simpan backup berapa hari terakhir
RETENTION_DAYS=14

# ── PROSES ──
mkdir -p "$BACKUP_DIR"
STAMP=$(date +%Y-%m-%d_%H%M)
FILE="$BACKUP_DIR/lakara_${STAMP}.sql.gz"

# Dump + kompres langsung
mysqldump --single-transaction --quick --skip-lock-tables \
  -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" 2>>"$BACKUP_DIR/backup.log" | gzip > "$FILE"

# Cek hasil
if [ -s "$FILE" ]; then
  echo "$(date) OK: $FILE ($(du -h "$FILE" | cut -f1))" >> "$BACKUP_DIR/backup.log"
else
  echo "$(date) GAGAL: dump kosong!" >> "$BACKUP_DIR/backup.log"
  rm -f "$FILE"
fi

# Hapus backup lebih tua dari RETENTION_DAYS
find "$BACKUP_DIR" -name "lakara_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# ════════════════════════════════════════════════════════════
# CARA PASANG DI cPanel:
# 1. Upload file ini ke /home/lakaraid/backup-db.sh
# 2. Edit DB_PASS di atas (atau seluruh konfigurasi)
# 3. chmod 700 /home/lakaraid/backup-db.sh   (biar password aman)
# 4. cPanel → Cron Jobs → tambah job harian jam 02:00:
#       0 2 * * *  /bin/bash /home/lakaraid/backup-db.sh
# 5. Restore kalau perlu:
#       gunzip < /home/lakaraid/db-backups/lakara_XXXX.sql.gz | mysql -u USER -p DB_NAME
#
# TIPS: sesekali download backup ke luar server (Google Drive/lokal)
#       biar aman kalau server bermasalah.
# ════════════════════════════════════════════════════════════
