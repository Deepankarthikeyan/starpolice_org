#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_PATH="${MONGODB_DATA_PATH:-$HOME/.mongodb/data}"

if ! pgrep -x mongod >/dev/null 2>&1; then
  mkdir -p "$DB_PATH"
  mongod --dbpath "$DB_PATH" --bind_ip 127.0.0.1 --port 27017 --fork --logpath /tmp/mongod.log
fi

for _ in $(seq 1 20); do
  if mongosh --quiet --eval 'db.runCommand({ ping: 1 })' >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

uri="${MONGODB_URI:-}"
if [ -f "$ROOT/server/.env" ]; then
  # shellcheck disable=SC1090
  set -a
  source "$ROOT/server/.env"
  set +a
  uri="${MONGODB_URI:-}"
fi

should_seed=1
if [[ -n "$uri" && "$uri" == *"starpolice_academy"* && "$uri" != *"starpolice_academy_dev"* ]]; then
  should_seed=0
fi
if [[ -n "$uri" && "$uri" != *"127.0.0.1"* && "$uri" != *"localhost"* && "$uri" != *"_dev"* ]]; then
  should_seed=0
fi

if [ "$should_seed" = 1 ]; then
  cd "$ROOT/server"
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
