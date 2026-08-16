#!/usr/bin/env bash

set -euo pipefail

#############################################
# Holy Matrimony Production Backend Deploy
#############################################

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

SERVER="holymatrimony"
REMOTE_APP_DIR="/home/ubuntu/holymatrimony/backend"
REMOTE_RELEASE_DIR="/home/ubuntu/releases"

JAR_NAME="backend-0.0.1-SNAPSHOT.jar"
LOCAL_JAR="$BACKEND_DIR/target/$JAR_NAME"

BRANCH="$(git -C "$ROOT_DIR" branch --show-current)"
COMMIT="$(git -C "$ROOT_DIR" rev-parse --short HEAD)"

REMOTE_UPLOAD="/home/ubuntu/backend-${COMMIT}.jar"

echo "============================================"
echo " Holy Matrimony Production Backend Deploy"
echo "============================================"
echo
echo "Branch : $BRANCH"
echo "Commit : $COMMIT"
echo

if [[ "$BRANCH" != "main" ]]; then
    echo "ERROR: Production deployments must run from main."
    exit 1
fi

if [[ -n "$(git -C "$ROOT_DIR" status --porcelain)" ]]; then
    echo "ERROR: Git working tree is not clean."
    git -C "$ROOT_DIR" status --short
    exit 1
fi

echo "===== BUILD BACKEND ====="

cd "$BACKEND_DIR"

./mvnw clean package

if [[ ! -f "$LOCAL_JAR" ]]; then
    echo "ERROR: Backend JAR was not created:"
    echo "$LOCAL_JAR"
    exit 1
fi

echo
echo "===== UPLOAD RELEASE ====="

scp \
    "$LOCAL_JAR" \
    "${SERVER}:${REMOTE_UPLOAD}"

echo
echo "===== DEPLOY RELEASE ====="

ssh "$SERVER" bash -s -- \
    "$COMMIT" \
    "$REMOTE_UPLOAD" \
    "$REMOTE_APP_DIR" \
    "$REMOTE_RELEASE_DIR" \
    "$JAR_NAME" <<'REMOTE'
set -euo pipefail

COMMIT="$1"
UPLOAD="$2"
APP_DIR="$3"
RELEASE_DIR="$4"
JAR_NAME="$5"

TARGET="${APP_DIR}/target/${JAR_NAME}"

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="${RELEASE_DIR}/backend-before-${COMMIT}-${STAMP}"

rollback() {
    echo
    echo "============================================"
    echo " BACKEND DEPLOYMENT FAILED"
    echo "============================================"

    if [[ -f "${BACKUP}/${JAR_NAME}" ]]; then

        echo
        echo "===== ROLLBACK ====="

        cp \
            "${BACKUP}/${JAR_NAME}" \
            "$TARGET"

        sudo systemctl restart holymatrimony.service

        echo "Rollback JAR restored."

        sleep 5

        sudo systemctl status \
            holymatrimony.service \
            --no-pager \
            -l || true
    else
        echo "No rollback JAR is available."
    fi

    rm -f "$UPLOAD"

    exit 1
}

trap rollback ERR

echo
echo "===== CREATE ROLLBACK BACKUP ====="

mkdir -p "$BACKUP"

cp \
    "$TARGET" \
    "${BACKUP}/${JAR_NAME}"

echo "Rollback backup:"
echo "$BACKUP"

echo
echo "===== INSTALL RELEASE ====="

cp "$UPLOAD" "$TARGET"

echo
echo "===== RESTART BACKEND ====="

sudo systemctl restart holymatrimony.service

echo
echo "===== WAIT FOR BACKEND ====="

READY=0

for attempt in $(seq 1 45); do

    if sudo ss -ltn \
        | grep -q ':8080 '; then

        READY=1
        break
    fi

    printf "Waiting for port 8080... %s/45\n" "$attempt"

    sleep 1
done

if [[ "$READY" -ne 1 ]]; then
    echo "ERROR: Backend did not open port 8080."
    false
fi

echo "OK: port 8080"

echo
echo "===== SERVICE ====="

sudo systemctl is-active \
    --quiet \
    holymatrimony.service

echo "OK: backend service active"

echo
echo "===== APPLICATION CHECK ====="

# Actuator currently requires authentication in production,
# so 200 or 401 both prove that Spring/Tomcat is responding.
HTTP_CODE="$(
    curl \
        -s \
        -o /dev/null \
        -w '%{http_code}' \
        --max-time 15 \
        http://127.0.0.1:8080/api/v1/actuator/health \
        || true
)"

case "$HTTP_CODE" in
    200)
        echo "OK: actuator health returned 200"
        ;;
    401)
        echo "OK: backend responding; actuator health is protected (401)"
        ;;
    *)
        echo "ERROR: unexpected backend response: HTTP ${HTTP_CODE}"
        false
        ;;
esac

echo
echo "===== FLYWAY ====="

sudo journalctl \
    -u holymatrimony.service \
    --since "5 minutes ago" \
    --no-pager \
    | grep -Ei \
      'Flyway|validated .* migrations|Migrating schema|Successfully applied|schema.*up to date' \
    | tail -40 \
    || true

echo
echo "===== IDENTITY STORAGE ====="

if [[ -f /etc/holymatrimony/backend.env ]]; then

    IDENTITY_DIR="$(
        grep '^IDENTITY_DOCUMENTS_DIRECTORY=' \
            /etc/holymatrimony/backend.env \
            | tail -1 \
            | cut -d= -f2-
    )"

    if [[ -n "$IDENTITY_DIR" ]]; then

        echo "Directory: $IDENTITY_DIR"

        test -d "$IDENTITY_DIR"
        test -r "$IDENTITY_DIR"
        test -w "$IDENTITY_DIR"

        echo "OK: identity storage accessible"
    fi
fi

echo
echo "===== CLEAN TEMP UPLOAD ====="

rm -f "$UPLOAD"

trap - ERR

echo
echo "============================================"
echo " DEPLOYMENT SUCCESSFUL"
echo " Release: ${COMMIT}"
echo " Rollback: ${BACKUP}"
echo "============================================"
REMOTE

echo
echo "Production backend deployment complete."
