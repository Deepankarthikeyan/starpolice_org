#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=mongo-env.sh
source "$ROOT/scripts/mongo-env.sh"

write_server_env

cd "$ROOT"
npm ci

cd "$PANEL_ROOT/server"
npm ci

cd "$PANEL_ROOT/package"
npm ci
