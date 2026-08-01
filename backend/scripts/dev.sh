#!/usr/bin/env bash
# Start the API in watch mode with pretty logs.
set -euo pipefail
cd "$(dirname "$0")/.."
export NODE_ENV=${NODE_ENV:-development}
export LOG_PRETTY=${LOG_PRETTY:-true}
export WORKSPACE_ROOT=${WORKSPACE_ROOT:-"$PWD/.workspace"}
mkdir -p "$WORKSPACE_ROOT"
npm run dev
