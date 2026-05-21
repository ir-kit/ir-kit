# `@ir-kit/schema`

Canonical JSON Schema 2020-12 IR shared across the OpenAPI and AsyncAPI codegen families. Source-agnostic — adapters fold hey-api's `IR.SchemaObject`, raw JSON Schema (any draft), and OpenAPI 3.0 `nullable` quirks into one shape so every emitter (`@ir-kit/openapi-{go,kotlin,swift,typescript}`, `@ir-kit/asyncapi-typescript`, `@ir-kit/k6-codegen`) reads the same model.

## Install

```sh
npm install @ir-kit/schema
# adapter from hey-api needs:
npm install @hey-api/shared
```

## Use

```ts
import {
  type Schema,
  classifyUnion,
  classifyObject,
  classifyEnumLiterals,
  extractEnumValues,
} from "@ir-kit/schema";

const schema: Schema = {
  oneOf: [{ type: "string" }, { type: "null" }],
};

const shape = classifyUnion(schema);
// → { kind: "single", inner: { type: "string" }, nullable: true }
```

## Adapters

```ts
import { fromHeyApi } from "@ir-kit/schema/adapters/heyapi";
import { fromJsonSchema } from "@ir-kit/schema/adapters/jsonschema";

const canonical = fromHeyApi(heyApiIrSchemaObject);
const fromAsync = fromJsonSchema(asyncSchema.json(), { dialect: "draft-07" });
const fromOas3  = fromJsonSchema(openapi30Schema); // `nullable: true` folded into type[]
```

## Scope

This is the **dialect**: types + classifiers + adapters. Per-target rendering (Go pointer vs Kotlin nullable, struct emission, enum identifier transforms) lives in each emitter package — see `@ir-kit/openapi`'s `SchemaToTypeOps<T,D>` interface.

Subset of JSON Schema 2020-12. Omitted (codegen can't bind cleanly): `$dynamicRef`, `$dynamicAnchor`, `unevaluatedProperties`, `unevaluatedItems`, `if`/`then`/`else`, `dependentSchemas`, `dependentRequired`, `contains`.

## Status

`0.1.0` — first release. Consumers (`@ir-kit/openapi`, `@ir-kit/asyncapi-typescript`, `@ir-kit/k6-codegen`) migrate incrementally in follow-up changesets.

## Repo

Source at [ir-kit/ir-kit](https://github.com/ir-kit/ir-kit/tree/main/packages/shared/schema).
