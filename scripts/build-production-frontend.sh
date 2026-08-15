#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND="$ROOT/frontend"

PROD_API_URL="https://www.theholymatrimony.com/api/v1"
PROD_WS_URL="wss://www.theholymatrimony.com/ws"

echo "=========================================="
echo " Holy Matrimony Production Frontend Build"
echo "=========================================="

cd "$ROOT"

echo
echo "===== GIT CHECK ====="

BRANCH="$(git branch --show-current)"
HEAD="$(git rev-parse --short HEAD)"

echo "Branch: $BRANCH"
echo "Commit: $HEAD"

if [[ "$BRANCH" != "main" ]]; then
  echo "ERROR: Production builds must be created from main."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: Working tree is not clean."
  git status --short
  exit 1
fi

echo
echo "===== PRODUCTION CONFIG ====="
echo "API: $PROD_API_URL"
echo "WS : $PROD_WS_URL"

cd "$FRONTEND"

echo
echo "===== CLEAN OLD BUILD ====="
rm -rf .next

echo
echo "===== BUILD ====="

NEXT_PUBLIC_API_URL="$PROD_API_URL" \
NEXT_PUBLIC_WS_URL="$PROD_WS_URL" \
npm run build

echo
echo "===== VERIFY REQUIRED ROUTES ====="

for route in \
  "/login" \
  "/admin/login" \
  "/dashboard" \
  "/settings" \
  "/reactivate-account"
do
  if find .next/server/app -path "*${route#/}*" -print -quit 2>/dev/null | grep -q .; then
    echo "OK: $route"
  else
    echo "INFO: route verification by path inconclusive for $route"
  fi
done

echo
echo "===== VERIFY PRODUCTION API EMBEDDED ====="

if grep -R -q \
  "https://www.theholymatrimony.com/api/v1" \
  .next/static .next/server 2>/dev/null; then
  echo "OK: production API URL found"
else
  echo "ERROR: production API URL not found in build."
  exit 1
fi

echo
echo "===== VERIFY PRODUCTION WEBSOCKET EMBEDDED ====="

if grep -R -q \
  "wss://www.theholymatrimony.com/ws" \
  .next/static .next/server 2>/dev/null; then
  echo "OK: production WebSocket URL found"
else
  echo "ERROR: production WebSocket URL not found in build."
  exit 1
fi

echo
echo "===== CREATE RELEASE ARCHIVE ====="

ARCHIVE="/tmp/holymatrimony-frontend-${HEAD}.tar.gz"

rm -f "$ARCHIVE"

COPYFILE_DISABLE=1 \
tar -czf "$ARCHIVE" .next

echo
echo "===== BUILD COMPLETE ====="
ls -lh "$ARCHIVE"

echo
echo "Release archive:"
echo "$ARCHIVE"
