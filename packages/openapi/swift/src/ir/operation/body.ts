import type { IR } from "@hey-api/shared";
import { classifyBody } from "@ir-kit/openapi";

import type { SwFunParam } from "../../sw-dsl/index.js";
import { swData, swFunParam, swOptional } from "../../sw-dsl/index.js";
import { paramIdent } from "../identifiers.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";

/**
 * Resolve an `IR.BodyObject` into the function parameters that show up
 * in both the protocol signature and the impl method:
 *
 * - `application/json` (and `+json`) → single `body: T`. When the
 *   schema collapses to `Any` (e.g. a `oneOf` with no discriminated
 *   union codegen), the param falls back to `Data` so the caller
 *   pre-encodes JSON — `Any` isn't `Encodable`, so emitting it would
 *   produce code that fails to compile.
 * - `multipart/form-data` + object schema → one param per property; binary fields become `Data`
 * - `application/x-www-form-urlencoded` + object schema → one param per property
 * - empty / octet-stream / image/* / unknown → `body: Data` (caller pre-encodes)
 */
export function buildBodyParams(
  body: IR.BodyObject,
  ctx: TypeCtx,
): ReadonlyArray<SwFunParam> {
  const shape = classifyBody(body);
  const schema = body.schema;

  switch (shape.kind) {
    case "json-opaque":
      return [swFunParam({ name: "body", type: swData })];
    case "json-typed":
      return [
        swFunParam({
          name: "body",
          type: schemaToType(schema, { ...ctx, propPath: ["body"] }),
        }),
      ];
    case "multipart-object":
      return objectBodyToFlatParams(schema, ctx, /* binaryAsData */ true);
    case "form-urlencoded-object":
      return objectBodyToFlatParams(schema, ctx, /* binaryAsData */ false);
    case "opaque":
      return [swFunParam({ name: "body", type: swData })];
  }
}

function objectBodyToFlatParams(
  schema: IR.SchemaObject,
  ctx: TypeCtx,
  binaryAsData: boolean,
): ReadonlyArray<SwFunParam> {
  const required = new Set(schema.required ?? []);
  return Object.entries(schema.properties ?? {}).map(
    ([propName, propSchema]) => {
      const isBinary =
        propSchema.type === "string" && propSchema.format === "binary";
      const t =
        binaryAsData && isBinary
          ? swData
          : schemaToType(propSchema, { ...ctx, propPath: ["body", propName] });
      const isRequired = required.has(propName);
      return swFunParam({
        name: paramIdent(propName),
        type: isRequired ? t : swOptional(t),
        default: isRequired ? undefined : "nil",
      });
    },
  );
}
