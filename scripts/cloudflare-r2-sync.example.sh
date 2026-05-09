#!/usr/bin/env bash
# Upload dist/libreoffice-wasm to Cloudflare R2 (run AFTER `npm run build`, BEFORE `npm run strip-libreoffice-dist`).
#
# Prerequisites:
#   - AWS CLI v2, configured profile with R2 API token (S3-compatible).
#   - Bucket created (Dashboard → R2 → Create bucket).
#
# Configure profile (~/.aws/credentials):
#   [r2]
#   aws_access_key_id = <R2 token access key>
#   aws_secret_access_key = <R2 secret>
#
# Endpoint URL uses your account id from R2 overview.

set -euo pipefail

BUCKET="${R2_BUCKET:?Set R2_BUCKET}"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:?Set CLOUDFLARE_ACCOUNT_ID}"
PREFIX="${R2_LIBREOFFICE_PREFIX:-libreoffice-wasm}"
ENDPOINT="https://${ACCOUNT_ID}.r2.cloudflarestorage.com"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SRC="${REPO_ROOT}/dist/libreoffice-wasm"

if [[ ! -d "${SRC}" ]]; then
  echo "Missing ${SRC}. Run: npm run build"
  exit 1
fi

aws s3 sync "${SRC}" "s3://${BUCKET}/${PREFIX}/" \
  --endpoint-url "${ENDPOINT}" \
  --profile "${AWS_PROFILE:-r2}"

echo "Uploaded to R2. Use:"
echo "  VITE_LIBREOFFICE_BASE_URL=https://<your-public-r2-host>/${PREFIX}/"
