#!/usr/bin/env bash
# Usage: ./deploy.sh
set -euo pipefail

NAME="lakara-id"

ROOT="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$ROOT/.deploy.env"
LOCAL_DIST="$ROOT/domains/com-${NAME}/dist"
DOMAIN="lakara.id"
# anggaprint is the cPanel PRIMARY domain → its docroot is ~/public_html.
# Addon/parked domains are served from ~/<domain>/. Pick the right server folder.

ZIP_NAME="deploy-${NAME}.zip"
ZIP_LOCAL="/tmp/${ZIP_NAME}"

if ! command -v lftp &> /dev/null; then
  echo "Error: lftp not found. Install: brew install lftp"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found"
  exit 1
fi
source "$ENV_FILE"

if [[ ! -d "$LOCAL_DIST" ]]; then
  echo "Error: $LOCAL_DIST not found — run generate first"
  exit 1
fi

# Step 1: zip dist — COPYFILE_DISABLE suppresses __MACOSX macOS metadata
echo "==> Zipping $LOCAL_DIST..."
rm -f "$ZIP_LOCAL"
(cd "$LOCAL_DIST" && COPYFILE_DISABLE=1 zip -r "$ZIP_LOCAL" . --exclude "*.DS_Store" > /dev/null)
echo "    $(du -sh "$ZIP_LOCAL" | cut -f1) zipped"

# Step 2: upload zip via FTP into the domain's folder.
# FTP user is chrooted at FTP_REMOTE (e.g. /home/anggapri/), so paths sent to
# the server must be RELATIVE — an absolute path would double the chroot prefix
# (e.g. /home/anggapri/home/anggapri/...) and fail with 550.
REMOTE_DIR="${FTP_REMOTE%/}/${TARGET_DIR}"
echo "==> Uploading to ${FTP_HOST}:${REMOTE_DIR}/${ZIP_NAME}..."
SCRIPT=$(mktemp)
printf 'set ftp:ssl-allow no\n'                                    >> "$SCRIPT"
printf 'set ftp:passive-mode on\n'                                 >> "$SCRIPT"
printf 'set net:max-retries 3\n'                                   >> "$SCRIPT"
printf 'set cmd:fail-exit yes\n'                                   >> "$SCRIPT"
printf 'open -p %s ftp://%s\n'    "$FTP_PORT" "$FTP_HOST"          >> "$SCRIPT"
printf 'user "%s" "%s"\n'         "$FTP_USER" "$FTP_PASS"          >> "$SCRIPT"
printf 'put -O "%s" %s\n'         "$TARGET_DIR" "$ZIP_LOCAL"       >> "$SCRIPT"
printf 'ls "%s"\n'                "$TARGET_DIR"                    >> "$SCRIPT"
printf 'quit\n'                                                    >> "$SCRIPT"
lftp -f "$SCRIPT"
rm "$SCRIPT"

rm -f "$ZIP_LOCAL"

# Step 3: trigger remote unzip via the shell webhook
TRIGGER_URL="${TRIGGER_URL:-http://trigger.anggaprint.com/index.php}"
if [[ -z "${SHELL_TOKEN:-}" ]]; then
  echo "==> SHELL_TOKEN not set in $ENV_FILE — skipping remote unzip trigger."
  echo "    Extract manually: unzip ${ZIP_NAME} in ${REMOTE_DIR}/"
else
  REMOTE_ZIP="${REMOTE_DIR}/${ZIP_NAME}"
  CMD="cd ~ && cd ${TARGET_DIR} && unzip -o -qq ${REMOTE_ZIP}"
  # CMD="cd ~ && cd ${TARGET_DIR} && unzip -o -qq ${REMOTE_ZIP} && rm -f ${REMOTE_ZIP}"
  echo "==> Triggering remote unzip at ${TRIGGER_URL}..."
  curl -fsS -X POST "$TRIGGER_URL" \
    -H "X-Token: ${SHELL_TOKEN}" \
    --data-urlencode "cmd=${CMD}"
  echo ""
  echo "==> Done! Site extracted into ${REMOTE_DIR}/ (zip removed)."
fi
