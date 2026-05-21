---
name: ir-kit-migrate
description: Migrate a project from the legacy `@ahmedrowaihi/*` npm scope to the new `@ir-kit/*` scope. Rewrites `import` / `require` statements across TypeScript / JavaScript files, updates `package.json` dependencies, and (optionally) refreshes lockfile + verifies the build. Use when the user mentions "migrate to ir-kit", "switch to @ir-kit", "upgrade from @ahmedrowaihi", or is upgrading any package previously under `@ahmedrowaihi/openapi-*`, `@ahmedrowaihi/asyncapi-*`, `@ahmedrowaihi/fn-schema-*`, `@ahmedrowaihi/k6*`, `@ahmedrowaihi/codegen-core`, `@ahmedrowaihi/openapi-ts-{orpc,faker,typia,paths}`, or `@ahmedrowaihi/create-k6`. Triggers on "ir-kit migrate", "@ir-kit migration", "rename scope from ahmedrowaihi". Do NOT use for unrelated package renames or for migrating between major versions of `@ir-kit/*` itself.
---

# Migration: `@ahmedrowaihi/*` → `@ir-kit/*`

The `@ahmedrowaihi/*` npm scope is being deprecated. All packages have moved to `@ir-kit/*` (same package names, swapped scope, version reset to `0.1.0`). This skill rewrites a consumer project to point at the new scope.

## Scope of the rename

| Old | New |
|---|---|
| `@ahmedrowaihi/openapi-core` | `@ir-kit/openapi` *(absorbed; see below)* |
| `@ahmedrowaihi/openapi-{go,kotlin,swift,typescript,tools,recon}` | `@ir-kit/openapi-{go,kotlin,swift,typescript,tools,recon}` |
| `@ahmedrowaihi/openapi-ts-{orpc,faker,typia,paths,k6}` | `@ir-kit/openapi-ts-{orpc,faker,typia,paths,k6}` |
| `@ahmedrowaihi/asyncapi-{core,typescript}` | `@ir-kit/asyncapi-{core,typescript}` |
| `@ahmedrowaihi/fn-schema-{core,typescript,cli,transformer,unplugin,loader}` | `@ir-kit/fn-schema-{core,typescript,cli,transformer,unplugin,loader}` |
| `@ahmedrowaihi/k6` | `@ir-kit/k6` |
| `@ahmedrowaihi/k6-{gen,toolkit}` | `@ir-kit/k6-{gen,toolkit}` |
| `@ahmedrowaihi/create-k6` | `@ir-kit/create-k6` |
| `@ahmedrowaihi/codegen-core` | `@ir-kit/codegen-core` |

Almost every entry is a pure scope substitution. The one exception is `openapi-core`: its content was absorbed into `@ir-kit/openapi` in 0.2.0 of that package, and `@ir-kit/openapi-core` is now deprecated. Handle this name change BEFORE the bulk scope swap (step 2 below).

## What the skill does

Run these steps in order. Each step is read-only or reversible until the final install.

### 1. Discover the surface

Find every file that references the old scope. Don't trust just `node_modules` — the rename touches sources, configs, docs, and lockfiles. Run:

```bash
rg -l "@ahmedrowaihi/" --hidden -g '!node_modules' -g '!.git' -g '!pnpm-lock.yaml' -g '!package-lock.json' -g '!yarn.lock'
```

Report the count and (optionally) list the files. If the count is zero, stop — nothing to migrate.

### 2. Rewrite source files

Two passes — the special-case rename first, then the bulk scope swap.

**Pass 2a — handle the `openapi-core` → `openapi` rename.** Every `@ahmedrowaihi/openapi-core` and `@ir-kit/openapi-core` reference becomes `@ir-kit/openapi`. Must run BEFORE the bulk swap or step 2b would turn the old name into the deprecated `@ir-kit/openapi-core`.

```bash
rg -l "@(ahmedrowaihi|ir-kit)/openapi-core" --hidden \
  -g '!node_modules' -g '!.git' -g '!pnpm-lock.yaml' -g '!package-lock.json' -g '!yarn.lock' \
  | xargs sed -i '' -E 's|@(ahmedrowaihi\|ir-kit)/openapi-core|@ir-kit/openapi|g'
```

On Linux, drop the `''` argument after `-i`.

**Pass 2b — bulk scope swap.** For every remaining `@ahmedrowaihi/<X>` reference, swap to `@ir-kit/<X>`. The fastest path is `ast-grep` (handles import / require / dynamic import nodes correctly across TS / JS); a plain `sed` works for pure scope substitution since the substring never appears in a context that should NOT be rewritten.

**Preferred — `ast-grep`** (if installed):

```bash
ast-grep --pattern '"@ahmedrowaihi/$REST"' --rewrite '"@ir-kit/$REST"' --update-all
```

That single rule covers `import "..."`, `require("...")`, dynamic `import("...")`, and any other quoted-string reference in JS / TS.

**Fallback — `sed`** (no extra install):

```bash
rg -l "@ahmedrowaihi/" --hidden \
  -g '!node_modules' -g '!.git' -g '!pnpm-lock.yaml' -g '!package-lock.json' -g '!yarn.lock' \
  | xargs sed -i '' 's|@ahmedrowaihi/|@ir-kit/|g'
```

### 3. Update `package.json` dependencies

Every entry whose key starts with `@ahmedrowaihi/` becomes `@ir-kit/<same-suffix>`. The version values should be **wiped and set to `^0.1.0`** because the new scope started fresh at `0.1.0` (the old major-version progression doesn't transfer across the scope rename).

Loop over every `package.json` in the project (except `node_modules`):

```bash
for f in $(find . -name "package.json" -not -path "./node_modules/*" -not -path "*/node_modules/*"); do
  jq '
    def renamed: if . == "@ahmedrowaihi/openapi-core" or . == "@ir-kit/openapi-core"
                 then "@ir-kit/openapi"
                 elif startswith("@ahmedrowaihi/")
                 then "@ir-kit/" + (sub("@ahmedrowaihi/"; ""))
                 else . end;
    (.dependencies, .devDependencies, .peerDependencies, .optionalDependencies)? |=
    with_entries(
      if (.key | renamed) != .key
      then { key: (.key | renamed), value: "^0.1.0" }
      else .
      end
    )
  ' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
done
```

If the consumer pins exact versions for a reason (lockfile-only workflow, vendored binaries), surface that decision rather than blanket-applying `^0.1.0`. For `@ir-kit/openapi`, pin `^0.2.0` (the version that absorbed `openapi-core`) rather than `^0.1.0`.

### 4. Wipe the lockfile + reinstall

The old lockfile pins resolved versions of `@ahmedrowaihi/*` that no longer exist (deprecated). Delete + reinstall:

```bash
# pnpm
rm -f pnpm-lock.yaml && pnpm install

# npm
rm -f package-lock.json && npm install

# yarn
rm -f yarn.lock && yarn install
```

### 5. Verify

Run the project's typecheck / build / test scripts. If anything fails, the most likely cause is an API change introduced alongside the scope rename — the `@ir-kit/openapi-{go,kotlin,swift}` packages got a major architecture refactor in their `0.1.0` cut (the per-language type dispatcher is now a thin wrapper over a shared dispatcher in `@ir-kit/openapi`). The PUBLIC API of `generate({ input, output })` is unchanged, but if the consumer was reaching into internals (`type/object.ts`, `type/union.ts`, etc.), those files were deleted — re-route to the public entry point.

## Edge cases

- **GitHub Action references** (`uses: ahmedrowaihi/contract-kit/actions/sdk-regen@...`) — repo also moved to `ir-kit/ir-kit`. Rewrite those `uses:` lines too:
  ```bash
  rg -l "ahmedrowaihi/contract-kit" --hidden -g '!node_modules' -g '!.git' \
    | xargs sed -i '' 's|ahmedrowaihi/contract-kit|ir-kit/ir-kit|g'
  ```
  GitHub serves redirects for the old URL for ~6 months, so existing pinned refs keep working — but updating is cleaner.

- **CI workflow secrets / OIDC trust** — if the project uses `@ir-kit/*` packages from CI that publishes its own SDKs (e.g. via the `sdk-regen` GitHub Action), `--generator-version` defaults to `latest` which now means `@ir-kit/openapi-<target>@latest` (0.1.x at first publish). No action needed unless the consumer pins a version.

- **Vendored generated code** (e.g. `examples/openapi-sdk-petstore/`) — for the `0.1.0` release of `@ir-kit/openapi-{go,kotlin,swift}`, regenerated output is byte-identical to what `@ahmedrowaihi/openapi-{go,kotlin,swift}@latest` produced. Vendored output does not need regeneration unless the consumer is on an older `@ahmedrowaihi/*` major.

## When NOT to use this skill

- The user is upgrading between `@ir-kit/*` major versions (e.g. `0.1.x` → `0.2.x`) — that's a different migration with its own per-package CHANGELOG entries.
- The user is renaming a different scope entirely — the rules here are baked for `@ahmedrowaihi/*` → `@ir-kit/*`.
- The project has no `@ahmedrowaihi/*` references — step 1 returns zero, nothing to do.
