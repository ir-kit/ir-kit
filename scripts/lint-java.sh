#!/usr/bin/env bash
# Checks generated Java with google-java-format and compiles it with javac.
set -euo pipefail

DIR="${1:-examples/petstore/java/sdk}"
GJF_VERSION="1.22.0"
JACKSON_VERSION="2.17.2"
CACHE="${JAVA_LINT_CACHE:-${RUNNER_TEMP:-/tmp}/java-lint}"
MAVEN="https://repo1.maven.org/maven2"

mkdir -p "$CACHE"
fetch() {
  local path="$1" out="$CACHE/$(basename "$1")"
  [ -f "$out" ] || curl -sSfL --retry 3 -o "$out" "$MAVEN/$path" || { rm -f "$out"; return 1; }
  echo "$out"
}

GJF=$(fetch "com/google/googlejavaformat/google-java-format/$GJF_VERSION/google-java-format-$GJF_VERSION-all-deps.jar")
CP=""
for a in core/jackson-databind core/jackson-core core/jackson-annotations datatype/jackson-datatype-jsr310; do
  name="${a#*/}"
  CP="$CP:$(fetch "com/fasterxml/jackson/${a%%/*}/$name/$JACKSON_VERSION/$name-$JACKSON_VERSION.jar")"
done

mapfile -t FILES < <(find "$DIR" -name '*.java' -type f | sort)
echo "Checking ${#FILES[@]} Java files in $DIR"

echo "=== google-java-format ==="
UNFORMATTED=$(java -jar "$GJF" --dry-run "${FILES[@]}")
if [ -n "$UNFORMATTED" ]; then
  echo "$UNFORMATTED"
  for f in $UNFORMATTED; do java -jar "$GJF" "$f" | diff -u "$f" - || true; done
  exit 1
fi
echo "OK"

echo "=== javac ==="
OUT=$(mktemp -d)
javac -Xlint:all -Werror -d "$OUT" -cp "${CP#:}" "${FILES[@]}"
echo "OK"
