#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT"

BRANCH="$(git branch --show-current)"
HEAD="$(git rev-parse --short HEAD)"
ARCHIVE="/tmp/holymatrimony-frontend-${HEAD}.tar.gz"

SERVER="holymatrimony"
REMOTE_ARCHIVE="/home/ubuntu/holymatrimony-frontend-${HEAD}.tar.gz"
REMOTE_FRONTEND="/home/ubuntu/holymatrimony/frontend"

echo "============================================"
echo " Holy Matrimony Production Frontend Deploy"
echo "============================================"
echo
echo "Branch : $BRANCH"
echo "Commit : $HEAD"

if [[ "$BRANCH" != "main" ]]; then
    echo "ERROR: Production deployment must run from main."
    exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
    echo "ERROR: Working tree is not clean."
    git status --short
    exit 1
fi

if [[ ! -f "$ARCHIVE" ]]; then
    echo "ERROR: Production archive does not exist:"
    echo "$ARCHIVE"
    echo
    echo "Run first:"
    echo "./scripts/build-production-frontend.sh"
    exit 1
fi

echo
echo "===== UPLOAD RELEASE ====="

scp "$ARCHIVE" "$SERVER:$REMOTE_ARCHIVE"

echo
echo "===== DEPLOY RELEASE ====="

ssh "$SERVER" bash -s -- "$HEAD" "$REMOTE_ARCHIVE" "$REMOTE_FRONTEND" <<'REMOTE'
set -euo pipefail

HEAD="$1"
ARCHIVE="$2"
FRONTEND="$3"

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="/home/ubuntu/releases/frontend-${HEAD}-before-${STAMP}"

echo
echo "===== CREATE ROLLBACK BACKUP ====="

mkdir -p "$BACKUP"

if [[ -d "$FRONTEND/.next" ]]; then
    cp -a "$FRONTEND/.next" "$BACKUP/.next"
fi

if [[ -f "$FRONTEND/.env.local" ]]; then
    cp "$FRONTEND/.env.local" "$BACKUP/.env.local"
fi

echo "Rollback backup:"
echo "$BACKUP"

echo
echo "===== INSTALL RELEASE ====="

cd "$FRONTEND"

rm -rf .next

tar -xzf "$ARCHIVE" -C "$FRONTEND"

test -d "$FRONTEND/.next"
test -f "$FRONTEND/.env.local"

echo
echo "===== RESTART PM2 ====="

pm2 restart frontend

sleep 5

if ! pm2 pid frontend | grep -Eq '^[1-9][0-9]*$'; then
    echo "ERROR: PM2 frontend process is not running."
    exit 1
fi

echo
echo "===== CHECK PORT 3000 ====="

if ! sudo ss -ltnp | grep -q ':3000'; then
    echo "ERROR: Frontend is not listening on port 3000."
    exit 1
fi

echo "OK: port 3000"

echo
echo "===== LOCAL HEALTH CHECK ====="

curl --fail --silent --show-error \
    --max-time 20 \
    http://127.0.0.1:3000/login \
    >/dev/null

echo "OK: local /login"

echo
echo "===== PUBLIC HEALTH CHECKS ====="

for URL in \
    "https://theholymatrimony.com/" \
    "https://theholymatrimony.com/login" \
    "https://theholymatrimony.com/admin/login" \
    "https://theholymatrimony.com/settings" \
    "https://theholymatrimony.com/reactivate-account"
do
    echo "Checking $URL"

    curl --fail --silent --show-error \
        --max-time 20 \
        "$URL" \
        >/dev/null

    echo "OK"
done

echo
echo "===== SAVE PM2 ====="

pm2 save

echo
echo "===== REMOVE TEMPORARY ARCHIVE ====="

rm -f "$ARCHIVE"

echo
echo "============================================"
echo " DEPLOYMENT SUCCESSFUL"
echo " Release: $HEAD"
echo " Rollback: $BACKUP"
echo "============================================"

REMOTE

echo
echo "Production frontend deployment complete."
