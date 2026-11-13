#!/usr/bin/env bash
# Installs ir-kit into an empty folder and runs every CLI command against
# fixtures/petstore.yaml, as a new user would.
#   scripts/smoke-published.sh                    # ir-kit@latest from npm
#   scripts/smoke-published.sh ir-kit@1.0.0
#   scripts/smoke-published.sh ./ir-kit-1.0.0.tgz # a `pnpm pack` tarball
#   SMOKE_LANGS=go scripts/smoke-published.sh     # skip the Java/Kotlin/Swift lints
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PKG="${1:-ir-kit@latest}"
case "$PKG" in ./* | ../* | /*) PKG="$(cd "$(dirname "$PKG")" && pwd)/$(basename "$PKG")" ;; esac

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cd "$WORK"
step() { printf '\n== %s\n' "$*"; }

step "install $PKG"
npm init -y >/dev/null
npm install --silent --no-audit --no-fund -D "$PKG" typescript@7 @types/node@24 amqplib @types/amqplib \
  @asyncapi/parser @asyncapi/avro-schema-parser @asyncapi/openapi-schema-parser \
  @typespec/compiler @typespec/openapi3 @typespec/protobuf ts-morph ts-json-schema-generator tsdown
cp "$ROOT/fixtures/petstore.yaml" "$ROOT/fixtures/user-events.yaml" .
npx ir --version

step "ir init"
npx ir init --input petstore.yaml --targets typescript,go,kotlin,swift,java,k6,docs
test -f ir.config.mts
cat > ir.config.mts <<'TS'
import { defineConfig } from "ir-kit";

export default defineConfig({
  input: "petstore.yaml",
  targets: {
    go: { output: "sdk/go", packageName: "petstore", gomod: "petstore" },
    kotlin: { output: "sdk/kotlin", packageName: "com.example.petstore" },
    swift: { output: "sdk/swift", swiftPackage: true },
    java: { output: "sdk/java", packageName: "com.example.petstore" },
    typescript: { output: "sdk/ts" },
    k6: { output: "loadtest/gen", defaultBaseUrl: "https://petstore3.swagger.io/api/v3" },
    docs: { output: "docs/index.html" },
    asyncapi: { input: "user-events.yaml", output: "events" },
  },
});
TS

step "ir generate / --check"
npx ir generate
npx ir generate --check
echo "// drift" >>"$(find sdk/go -name '*.go' | head -1)"
if npx ir generate --check; then echo "--check missed an edited file" >&2; exit 1; fi
npx ir generate

step "typecheck TypeScript and AsyncAPI output"
cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "lib": ["ES2022", "DOM"],
    "types": ["node"]
  },
  "include": ["sdk/ts/**/*.ts", "events/**/*.ts"],
  "exclude": ["events/**/*.template.ts"]
}
JSON
npx tsc -p .

if command -v go >/dev/null; then
  step "go build + vet"
  (cd sdk/go && go build ./... && go vet ./... && test -z "$(gofmt -l .)")
fi
# Same checks as the CI language jobs; each runs only when its toolchain is
# installed. Set SMOKE_LANGS="" to skip them.
for lang in ${SMOKE_LANGS-java kotlin swift}; do
  tool=java; [ "$lang" = swift ] && tool=swift
  if command -v "$tool" >/dev/null; then
    step "lint $lang"
    (cd "$ROOT" && "./scripts/lint-$lang.sh" "$WORK/sdk/$lang")
  fi
done

step "ir sdk all / spec / docs"
npx ir sdk all petstore.yaml --output sdk-all >/dev/null
test -d sdk-all/go -a -d sdk-all/typescript
npx ir spec convert petstore.yaml --to proto --out petstore.proto
npx ir spec convert petstore.proto --to openapi3 --out roundtrip.json
npx ir spec diff petstore.yaml --after roundtrip.json >/dev/null
npx ir docs petstore.yaml --out docs.html
test -s docs.html

step "ir fn-schema"
mkdir -p src
printf 'export function add(a: number, b: number): number {\n  return a + b;\n}\n' >src/math.ts
npx ir fn-schema extract --patterns "src/**/*.ts" --bundle fn.json
grep -q '"add"' fn.json

step "ir k6"
npx ir k6 sync petstore.yaml --output k6 --scaffold >/dev/null
test -f k6/loadtests/addPet.ts
npx ir k6 bundle k6/loadtests/addPet.ts --output k6/dist >/dev/null
test -s k6/dist/addPet.mjs

printf '\nsmoke passed for %s\n' "$PKG"
