#!/usr/bin/env bash
# Shared MongoDB / .env helpers for Cloud Agent scripts.

PANEL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../starpolice_panel-master" && pwd)"
SERVER_ENV="$PANEL_ROOT/server/.env"

write_server_env() {
  if [ -n "${MONGODB_URI:-}" ]; then
    cat >"$SERVER_ENV" <<EOF
PORT=5000
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET:-change-this-secret-in-production}
CLIENT_URL=${CLIENT_URL:-http://localhost:5173}
EOF
    return
  fi

  if [ ! -f "$SERVER_ENV" ]; then
    cp "$PANEL_ROOT/server/.env.example" "$SERVER_ENV"
  fi
}

# Load MONGODB_URI from server/.env when not already in the environment.
load_mongodb_uri() {
  if [ -n "${MONGODB_URI:-}" ]; then
    return
  fi
  if [ -f "$SERVER_ENV" ]; then
    # shellcheck disable=SC1090
    set -a
    source "$SERVER_ENV"
    set +a
  fi
}

uses_local_mongodb() {
  load_mongodb_uri
  local uri="${MONGODB_URI:-}"
  [ -z "$uri" ] || [[ "$uri" == *"127.0.0.1"* ]] || [[ "$uri" == *"localhost"* ]]
}

# Never auto-seed production Atlas (starpolice_academy without _dev).
should_auto_seed() {
  load_mongodb_uri
  local uri="${MONGODB_URI:-}"
  if [ -z "$uri" ]; then
    return 0
  fi
  if [[ "$uri" == *"starpolice_academy_dev"* ]] || [[ "$uri" == *"127.0.0.1"* ]] || [[ "$uri" == *"localhost"* ]]; then
    return 0
  fi
  if [[ "$uri" == *"starpolice_academy"* ]] && [[ "$uri" != *"starpolice_academy_dev"* ]]; then
    return 1
  fi
  return 1
}
