#!/usr/bin/env bash
# Compiles a generated Kotlin SDK with kotlinc against the runtime's
# dependencies (kotlinx.serialization, coroutines, datetime, OkHttp).
set -euo pipefail

SDK_DIR="${1:?usage: build-kotlin.sh <sdk-dir>}"
KOTLIN_VERSION="${KOTLIN_VERSION:-2.1.0}"
CACHE_DIR="${KOTLIN_CACHE_DIR:-$HOME/.cache/ir-kit-kotlin}"
MAVEN="https://repo1.maven.org/maven2"

DEPS=(
  "org/jetbrains/kotlinx/kotlinx-serialization-core-jvm/1.7.3/kotlinx-serialization-core-jvm-1.7.3.jar"
  "org/jetbrains/kotlinx/kotlinx-serialization-json-jvm/1.7.3/kotlinx-serialization-json-jvm-1.7.3.jar"
  "org/jetbrains/kotlinx/kotlinx-coroutines-core-jvm/1.9.0/kotlinx-coroutines-core-jvm-1.9.0.jar"
  "org/jetbrains/kotlinx/kotlinx-datetime-jvm/0.6.1/kotlinx-datetime-jvm-0.6.1.jar"
  "com/squareup/okhttp3/okhttp/4.12.0/okhttp-4.12.0.jar"
  "com/squareup/okio/okio-jvm/3.6.0/okio-jvm-3.6.0.jar"
)

mkdir -p "$CACHE_DIR/deps"
KOTLINC="$CACHE_DIR/kotlinc-$KOTLIN_VERSION/kotlinc"
if [ ! -x "$KOTLINC/bin/kotlinc" ]; then
  curl -sSfL --retry 5 --retry-all-errors -o "$CACHE_DIR/kotlinc.zip" \
    "https://github.com/JetBrains/kotlin/releases/download/v$KOTLIN_VERSION/kotlin-compiler-$KOTLIN_VERSION.zip"
  unzip -q -o "$CACHE_DIR/kotlinc.zip" -d "$CACHE_DIR/kotlinc-$KOTLIN_VERSION"
  rm "$CACHE_DIR/kotlinc.zip"
fi

CLASSPATH=""
for dep in "${DEPS[@]}"; do
  jar="$CACHE_DIR/deps/$(basename "$dep")"
  [ -f "$jar" ] || curl -sSfL --retry 5 --retry-all-errors -o "$jar" "$MAVEN/$dep"
  CLASSPATH="$CLASSPATH${CLASSPATH:+:}$jar"
done

OUT_DIR="$(mktemp -d)"
SOURCES="$OUT_DIR/sources.txt"
trap 'rm -rf "$OUT_DIR"' EXIT
find "$SDK_DIR" -name '*.kt' -type f >"$SOURCES"

echo "Compiling $(wc -l <"$SOURCES" | tr -d ' ') Kotlin files in $SDK_DIR"
"$KOTLINC/bin/kotlinc" \
  -Xplugin="$KOTLINC/lib/kotlinx-serialization-compiler-plugin.jar" \
  -Werror \
  -cp "$CLASSPATH" \
  -d "$OUT_DIR/classes" \
  "@$SOURCES"

echo "✅ Kotlin SDK compiles."
