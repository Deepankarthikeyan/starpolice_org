#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=mongo-env.sh
source "$ROOT/scripts/mongo-env.sh"

write_server_env
load_mongodb_uri

DB_PATH="${MONGODB_DATA_PATH:-$HOME/.mongodb/data}"

if uses_local_mongodb; then
  if ! command -v mongod >/dev/null 2>&1; then
    echo "Local MongoDB is required but mongod is not installed. Set MONGODB_URI to Atlas (live) or use the environment Dockerfile build."
    exit 1
  fi
  if ! pgrep -x mongod >/dev/null 2>&1; then
    mkdir -p "$DB_PATH"
    mongod --dbpath "$DB_PATH" --bind_ip 127.0.0.1 --port 27017 --fork --logpath /tmp/mongod.log
  fi
  for _ in $(seq 1 30); do
    if mongosh --quiet --eval 'db.runCommand({ ping: 1 })' >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
else
  echo "Using external MongoDB from MONGODB_URI (live or Atlas)."
fi

if should_auto_seed; then
  cd "$PANEL_ROOT/server"
  if ! node --input-type=module -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);
const count = await mongoose.connection.db.collection('users').countDocuments({ role: 'superadmin' });
await mongoose.disconnect();
process.exit(count > 0 ? 0 : 1);
" 2>/dev/null; then
    npm run seed
  fi
fi

start_tmux() {
  local name="$1"
  local cmd="$2"
  if tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$name" 2>/dev/null; then
    return
  fi
  tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$name" -c "$ROOT" -- "${SHELL:-bash}" -l -c "$cmd"
}

start_tmux starpolice-api "cd \"$PANEL_ROOT/server\" && npm start"
start_tmux starpolice-panel "cd \"$PANEL_ROOT/package\" && npm run dev -- --host 0.0.0.0 --port 5173"
start_tmux starpolice-site "cd \"$ROOT\" && npm run dev"

for _ in $(seq 1 60); do
  if curl -sf http://127.0.0.1:5000/api/health >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
