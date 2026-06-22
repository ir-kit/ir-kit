#!/usr/bin/env bash
set -euo pipefail

SNAPSHOT_DIR="${1:-packages/ts-go/src/__snapshots__}"

if [ ! -d "$SNAPSHOT_DIR" ]; then
  echo "Directory not found: $SNAPSHOT_DIR"
  exit 1
fi

GO_COUNT=$(find "$SNAPSHOT_DIR" -name '*.go' -type f | wc -l | tr -d ' ')

if [ "$GO_COUNT" -eq 0 ]; then
  echo "No .go files found in $SNAPSHOT_DIR"
  exit 0
fi

echo "Checking $GO_COUNT Go files in $SNAPSHOT_DIR"
echo ""
ERRORS=0

echo "=== gofmt ==="
UNFORMATTED=$(gofmt -l "$SNAPSHOT_DIR" 2>/dev/null || true)
if [ -n "$UNFORMATTED" ]; then
  echo "Unformatted files:"
  echo "$UNFORMATTED"
  echo ""
  gofmt -d "$SNAPSHOT_DIR"
  ERRORS=1
else
  echo "OK"
fi

echo ""
echo "=== goimports ==="
BADIMPORTS=$(goimports -l "$SNAPSHOT_DIR" 2>/dev/null || true)
if [ -n "$BADIMPORTS" ]; then
  echo "Files with incorrect imports:"
  echo "$BADIMPORTS"
  echo ""
  goimports -d "$SNAPSHOT_DIR"
  ERRORS=1
else
  echo "OK"
fi

if [ -f "$SNAPSHOT_DIR/go.mod" ]; then
  echo ""
  echo "=== go vet ==="
  if ! (cd "$SNAPSHOT_DIR" && go vet ./...); then
    ERRORS=1
  else
    echo "OK"
  fi

  echo ""
  echo "=== go build ==="
  if ! (cd "$SNAPSHOT_DIR" && go build ./...); then
    ERRORS=1
  else
    echo "OK"
  fi
fi

echo ""
if [ "$ERRORS" -ne 0 ]; then
  echo "❌ Go lint failed."
  echo ""
  echo "Fix formatting:  gofmt -w $SNAPSHOT_DIR"
  echo "Fix imports:     goimports -w $SNAPSHOT_DIR"
  exit 1
fi

echo "✅ All Go files pass checks."
