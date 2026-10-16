#!/usr/bin/env bash
# Point local dev at Atlas starpolice_academy_dev + Render dev API.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ -z "${ATLAS_DEV_PASSWORD:-}" ]; then
  echo "Set your Atlas password first, then run:"
  echo '  export ATLAS_DEV_PASSWORD="your-db-password"'
  echo "  bash scripts/use-dev-atlas.sh"
  exit 1
fi

ENC_PASS="$ATLAS_DEV_PASSWORD"
# Basic encode for @ : / in password if needed — prefer pasting URI from Atlas Connect when possible.
cat > "$ROOT/server/.env" <<EOF
PORT=5000
MONGODB_URI=mongodb+srv://deepankarthikeyan2000_db_user:${ENC_PASS}@deepan.wmec4vz.mongodb.net/starpolice_academy_dev?retryWrites=true&w=majority
JWT_SECRET=dev-only-change-me
CLIENT_URL=http://localhost:5173
EOF

echo 'VITE_API_URL=https://starpolice-api-dev.onrender.com' > "$ROOT/package/.env"

echo "Updated server/.env → Atlas starpolice_academy_dev"
echo "Updated package/.env → https://starpolice-api-dev.onrender.com"
echo "Run API: cd server && npm start"
echo "Run panel: cd package && npm run dev"
