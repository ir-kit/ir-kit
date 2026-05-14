# Contributing

The fastest way to ship a change here is to copy a sibling package, but the sibling you pick matters — conventions drifted before they were written down. This file captures the things that actually bit us.

## Workspace setup

```bash
pnpm install        # links workspace deps via pnpm-workspace.yaml
pnpm build          # turbo build across all packages
pnpm typecheck      # all packages
pnpm test           # all packages (uses --passWithNoTests, so missing tests aren't failures)
```

## House conventions

### Relative imports always carry `.js`

```ts
//   good
import { foo } from "./foo.js";
import { bar } from "./bar/index.js";
//   bad
import { foo } from "./foo";       // breaks strict Node ESM consumers
import { foo } from "./foo.ts";    // breaks tsc emit
```

We compile with `moduleResolution: bundler`, but the published `dist/*.js` is consumed by anything from esbuild to plain `node`. Bare relative imports work under bundlers and tolerant loaders; strict Node ESM rejects them. Add `.js` in source — universally compatible.

For directory imports, write `"./foo/index.js"` explicitly, not `"./foo"`.

### `test` script is always `vitest run --passWithNoTests`

A package without tests should be a documented zero-finding, not a CI failure. The flag costs nothing when tests exist, prevents foot-guns when they don't.

### Comments

- **Default to none.** Code with self-explanatory names doesn't need a comment.
- **JSDoc on the public API surface only** — exports a consumer will read. Each field gets one short line + `@default` where relevant.
- **One short `// why:` line** for non-obvious decisions: a workaround for a bug, a constraint imposed by an external tool, a deliberate non-pattern. Format it so removing it would actually confuse the next reader.
- **No comment walls.** No multi-paragraph headers explaining "what this module does" — the README does that.
- **Never restate the task or the call site** ("used by X", "added for the Y flow", "fixes #123"). That belongs in the PR / commit. Comments rot; commits don't.

### Reuse the `@hey-api` machinery — don't reinvent it

The TypeScript codegen layer in this repo (everything that emits `.ts` files) is built on hey-api's primitives. Pull from `/Users/sudorw/development/thmanyah/openapi-ts` (sibling checkout) when you're about to roll your own.

| Need | Use |
| --- | --- |
| Bundle external `$ref`s in an OpenAPI spec | `$RefParser` from `@hey-api/json-schema-ref-parser` |
| Normalize 2.0 / 3.0 / 3.1 specs into one IR shape | `parseSpec` from `@ahmedrowaihi/openapi-tools/parse` (wraps hey-api's parser) |
| Normalize spec keys/identifiers (`safe-normalize`) | `normalizeSpec` + `SAFE_NORMALIZE` from `@ahmedrowaihi/openapi-core` |
| Safe-write a generated output directory | `assertSafeOutputDir` from `@ahmedrowaihi/codegen-core` |
| Build TypeScript ASTs (when emitting `.ts`) | `$` DSL from `@hey-api/openapi-ts` — `$.const`, `$.func`, `$.type.*`, `$.literal`, `$().attr().call()`. Compiles to `ts.factory` underneath, so `.toAst()` returns plain TS AST when you need to print standalone. |
| Faker heuristics (format → faker method, field-name hints) | `resolveFakerCall`, `DEFAULT_FORMAT_MAPPING`, `DATE_METHODS` from `@ahmedrowaihi/openapi-ts-faker/core` |
| Spec server / security walking | helpers in `@ahmedrowaihi/openapi-core` |

For **non-TypeScript codegen** (Swift / Go / Kotlin native generators), keep your own DSL — hey-api's `$` DSL is TypeScript-targeting. See `openapi-swift/src/sw-dsl/` for the established shape: per-language IR + DSL + compiler + project layers.

When in doubt: read `packages/openapi/swift/src/generate.ts` for the standalone generator pattern, or `packages/openapi/plugins/faker/src/plugin.ts` for the hey-api-plugin pattern.

### Standalone generator vs hey-api plugin

Two shapes coexist, and most "new generator" work should ship both:

- **Standalone** lives under `packages/<track>/<lang>/` (e.g. `packages/openapi/swift`). Exposes `generate({ input, output })`. No hey-api plugin runner required at the call site.
- **hey-api plugin wrapper** lives under `packages/<track>/plugins/<name>/` or `packages/<track>/hey-api/`. Thin layer that reads the bundled spec from `plugin.context.spec` and delegates to the standalone generator.

CLIs (`fn-schema-cli`, `k6-tools`, etc.) should drive the standalone path. The hey-api plugin variant is for users already on `openapi-ts.config.ts`.

### Comments in changesets

See [`.changeset/README.md`](./.changeset/README.md) — one sentence per change, no code blocks.

### `exports` field

- Single entry (`.`) is the default. Only add subpaths when there's a real consumer.
- Anything you expose at a subpath **must** survive `node --input-type=module -e "import('@your/pkg/sub')"` once. Subpaths bypass the main entry's compatibility tests and rot silently otherwise.

### `gen` as a path component

CodeRabbit's path filter `!**/gen/**` skips reviews on directories named `gen` (intended for generated example output). When we name a *source* package `gen` (e.g. `packages/k6/gen`), reviews get silently skipped. Already-shipped exception: `@ahmedrowaihi/k6-gen` lives at `packages/k6/gen`. If you add another generator package, prefer `generator/` over `gen/` for the directory.

## Scaffolding a new package

```bash
pnpm new-package <name> <path>     # see tooling/template/ for what gets copied
```

The template ships a package.json / tsconfig.json / tsconfig.build.json / src/index.ts pre-wired with everything above. Edit metadata in the resulting `package.json` (description, keywords, repo directory) before committing.

## Releases

Run on [Changesets](https://github.com/changesets/changesets). Three plugins ship in lockstep — see [`.changeset/README.md`](./.changeset/README.md).

```bash
pnpm changeset           # describe a change
pnpm version-packages    # bump versions + write CHANGELOGs (locally)
pnpm release             # build + publish via changeset publish
```

In CI, pushing a `.changeset/*.md` to `main` opens a "Version Packages" PR; merging that PR publishes to npm.
