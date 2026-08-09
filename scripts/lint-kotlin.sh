#!/usr/bin/env bash
set -euo pipefail

SNAPSHOT_DIR="${1:-packages/openapi-kotlin/src/kt-compiler/__snapshots__}"

if [ ! -d "$SNAPSHOT_DIR" ]; then
  echo "Directory not found: $SNAPSHOT_DIR"
  exit 1
fi

KT_COUNT=$(find "$SNAPSHOT_DIR" -name '*.kt' -type f | wc -l | tr -d ' ')

if [ "$KT_COUNT" -eq 0 ]; then
  echo "No .kt files found in $SNAPSHOT_DIR"
  exit 0
fi

echo "Checking $KT_COUNT Kotlin files in $SNAPSHOT_DIR against ktlint"
echo ""
ERRORS=0

# ktlint --format exits non-zero even when it makes no change, so let `diff` be the
# sole arbiter: capture ktlint's canonical output, then compare.
FORMATTED="$(mktemp)"
trap 'rm -f "$FORMATTED"' EXIT

while IFS= read -r file; do
  ktlint --format --stdin --log-level=none <"$file" >"$FORMATTED" 2>/dev/null || true
  if ! diff -q "$FORMATTED" "$file" >/dev/null 2>&1; then
    echo "Not canonically formatted: $file"
    diff "$file" "$FORMATTED" || true
    echo ""
    ERRORS=1
  fi
done < <(find "$SNAPSHOT_DIR" -name '*.kt' -type f)

if [ "$ERRORS" -ne 0 ]; then
  echo "❌ Kotlin lint failed — the printer output diverges from ktlint."
  echo "Fix the PRINTER, not the snapshot."
  exit 1
fi

echo "✅ All Kotlin files pass ktlint checks."
