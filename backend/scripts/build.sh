#!/usr/bin/env bash
# Typecheck (including tests) and compile to dist/.
set -euo pipefail
cd "$(dirname "$0")/.."
npx tsc -p tsconfig.test.json --noEmit
npm run build
