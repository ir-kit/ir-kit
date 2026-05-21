import type { IR } from "@hey-api/shared";
import { classifyBody, iterateObjectProperties } from "@ir-kit/openapi";

import {
  type KtFunParam,
  ktByteArray,
  ktFunParam,
  ktNullable,
} from "../../kt-dsl/index.js";
import { paramIdent } from "../identifiers.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";

/**
 * Resolve an `IR.BodyObject` into the function parameters that show up
 * in both the interface signature and the impl method:
 *
 * - `application/json` (and `+json`) → single `body: T`. When the
 *   schema collapses to `Any` (e.g. a `oneOf` with no discriminated
 *   union codegen), the param falls back to `ByteArray` so the caller
 *   pre-encodes JSON — `Any` isn't `@Serializable`, so emitting it
 *   would produce code that fails to compile.
 * - `multipart/form-data` + object schema → one param per property; binary fields become `ByteArray`
 * - `application/x-www-form-urlencoded` + object schema → one param per property
 * - empty / octet-stream / image/* / unknown → `body: ByteArray` (caller pre-encodes)
 */
export function buildBodyParams(
  body: IR.BodyObject,
  ctx: TypeCtx,
): ReadonlyArray<KtFunParam> {
  const shape = classifyBody(body);
  const schema = body.schema;

  switch (shape.kind) {
    case "json-opaque":
      return [ktFunParam({ name: "body", type: ktByteArray })];
    case "json-typed":
      return [
        ktFunParam({
          name: "body",
          type: schemaToType(schema, { ...ctx, propPath: ["body"] }),
        }),
      ];
    case "multipart-object":
      return objectBodyToFlatParams(schema, ctx, /* binaryAsByteArray */ true);
    case "form-urlencoded-object":
      return objectBodyToFlatParams(schema, ctx, /* binaryAsByteArray */ false);
    case "opaque":
      return [ktFunParam({ name: "body", type: ktByteArray })];
  }
}

function objectBodyToFlatParams(
  schema: IR.SchemaObject,
  ctx: TypeCtx,
  binaryAsByteArray: boolean,
): ReadonlyArray<KtFunParam> {
  return Array.from(iterateObjectProperties(schema)).map(
    ({ jsonKey: propName, schema: propSchema, required, isBinary }) => {
      const t =
        binaryAsByteArray && isBinary
          ? ktByteArray
          : schemaToType(propSchema, { ...ctx, propPath: ["body", propName] });
      return ktFunParam({
        name: paramIdent(propName),
        type: required ? t : ktNullable(t),
        default: required ? undefined : "null",
      });
    },
  );
}
