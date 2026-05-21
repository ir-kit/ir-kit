# `@ir-kit/typespec-loader`

Compile a [TypeSpec](https://typespec.io) file or inline source to an OpenAPI 3 document in memory. Thin wrapper over `@typespec/compiler` + `@typespec/openapi3` — plugs into any ir-kit OpenAPI generator at the spec-loading boundary.

Part of [ir-kit](https://github.com/ir-kit/ir-kit).

## Install

```sh
npm install @ir-kit/typespec-loader
# Peer deps (install whichever emitters you'll use):
npm install @typespec/compiler @typespec/openapi3 @typespec/json-schema @typespec/protobuf
```

## Usage

```ts
import { compileTypespec } from "@ir-kit/typespec-loader";

// From a file path
const { document } = await compileTypespec({ path: "./api.tsp" });

// From inline source
const { document } = await compileTypespec({
  source: `
    @service(#{ title: "Petstore" })
    namespace Petstore;

    model Pet { id: int32; name: string; }
    op listPets(): Pet[];
  `,
  imports: ["@typespec/http"],
});
```

No disk artifacts survive the call — compilation runs against a temp dir that's cleaned up automatically.

## Capture mode

For emitters that don't expose a `getX()` programmatic API (e.g. `@typespec/json-schema`, `@typespec/protobuf`), use `compileTypespecCapture` — it wraps the compiler host and intercepts `writeFile` calls so the emitted files come back as an in-memory `{ path → content }` map.

```ts
import { compileTypespecCapture } from "@ir-kit/typespec-loader";

const { files } = await compileTypespecCapture(
  { path: "./api.tsp" },
  { emitter: "@typespec/json-schema" },
);
```

## API

| Export                                                                    | Description                                            |
| ------------------------------------------------------------------------- | ------------------------------------------------------ |
| `compileTypespec(input, opts?)`                                           | Compile to OpenAPI 3, return `{ document, documents }` |
| `compileTypespecCapture(input, opts)`                                     | Run any emitter, return `{ files }` map                |
| `isTypespecPath(input)`                                                   | Type predicate — `true` for `.tsp` string paths        |
| `CompileTypespecInput`, `CompileTypespecOptions`, `CompileTypespecResult` | Public types                                           |

Multi-service TypeSpec entries emit multiple OpenAPI documents — access via `result.documents`. The single-document `result.document` getter throws when the entry produces more than one (catch-and-handle if your entry might be versioned or multi-service).
