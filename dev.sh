#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_VENV_DIR="${BACKEND_VENV_DIR:-$BACKEND_DIR/venv}"

declare -a FRONTEND_CMD=()
BACKEND_PID=""
FRONTEND_PID=""

log() {
  printf '[dev] %s\n' "$*"
}

ensure_backend_virtualenv() {
  if [[ ! -f "$BACKEND_VENV_DIR/bin/activate" ]]; then
    cat <<'EOF' >&2
[dev] Could not find the backend virtual environment.
[dev] Create it with: python -m venv backend/venv && source backend/venv/bin/activate && pip install -r backend/requirements.txt
EOF
    exit 1
  fi
}

set_frontend_cmd() {
  if [[ -n "${FRONTEND_DEV_CMD:-}" ]]; then
    # Allow overriding via env var, e.g. FRONTEND_DEV_CMD="npm run dev -- --host 0.0.0.0"
    read -r -a FRONTEND_CMD <<<"${FRONTEND_DEV_CMD}"
    return
  fi

  if [[ -f "$FRONTEND_DIR/yarn.lock" ]]; then
    FRONTEND_CMD=(yarn dev)
  elif [[ -f "$FRONTEND_DIR/pnpm-lock.yaml" ]]; then
    FRONTEND_CMD=(pnpm dev)
  else
    FRONTEND_CMD=(npm run dev)
  fi
}

start_backend() {
  log "Starting Django server (${BACKEND_VENV_DIR})..."
  cd "$BACKEND_DIR"
  # shellcheck disable=SC1090
  source "$BACKEND_VENV_DIR/bin/activate"
  python manage.py runserver
}

start_frontend() {
  log "Starting frontend (${FRONTEND_CMD[*]})..."
  cd "$FRONTEND_DIR"
  "${FRONTEND_CMD[@]}"
}

cleanup() {
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    log "Stopping Django server (PID $BACKEND_PID)..."
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    log "Stopping frontend dev server (PID $FRONTEND_PID)..."
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

monitor_processes() {
  while true; do
    for pid in "$@"; do
      if ! kill -0 "$pid" 2>/dev/null; then
        local status=0
        wait "$pid" || status=$?
        return $status
      fi
    done
    sleep 1
  done
}

main() {
  ensure_backend_virtualenv
  set_frontend_cmd

  trap cleanup EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM

  start_backend &
  BACKEND_PID=$!

  start_frontend &
  FRONTEND_PID=$!

  monitor_processes "$BACKEND_PID" "$FRONTEND_PID"
}

main
