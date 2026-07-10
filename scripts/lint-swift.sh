#!/usr/bin/env bash
set -euo pipefail

SNAPSHOT_DIR="${1:-packages/openapi-swift/src/swift-compiler/__snapshots__}"

if [ ! -d "$SNAPSHOT_DIR" ]; then
  echo "Directory not found: $SNAPSHOT_DIR"
  exit 1
fi

SWIFT_COUNT=$(find "$SNAPSHOT_DIR" -name '*.swift' -type f | wc -l | tr -d ' ')

if [ "$SWIFT_COUNT" -eq 0 ]; then
  echo "No .swift files found in $SNAPSHOT_DIR"
  exit 0
fi

echo "Checking $SWIFT_COUNT Swift files in $SNAPSHOT_DIR against swift-format"
echo ""
ERRORS=0

while IFS= read -r file; do
  if ! swift format - <"$file" 2>/dev/null | diff -q - "$file" >/dev/null 2>&1; then
    echo "Not canonically formatted: $file"
    swift format - <"$file" 2>/dev/null | diff "$file" - || true
    echo ""
    ERRORS=1
  fi
done < <(find "$SNAPSHOT_DIR" -name '*.swift' -type f)

if [ "$ERRORS" -ne 0 ]; then
  echo "❌ Swift lint failed — the printer output diverges from swift-format."
  echo "Fix the PRINTER, not the snapshot."
  exit 1
fi

echo "✅ All Swift files pass swift-format checks."
