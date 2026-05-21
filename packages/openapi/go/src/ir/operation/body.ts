import type { IR } from "@hey-api/shared";
import { classifyBody, iterateObjectProperties } from "@ir-kit/openapi";

import {
  type GoFuncParam,
  type GoType,
  goByte,
  goFuncParam,
  goPtr,
  goSlice,
} from "../../go-dsl/index.js";
import { paramIdent } from "../identifiers.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";

const goBytes = () => goSlice(goByte);

/**
 * Resolve an `IR.BodyObject` into the function parameters for the
 * generated Go method. Always positional (Go has no named args).
 *
 * - `application/json` (and `+json`) → single `body *T` (pointer for
 *   nullability symmetry with optional struct fields). When the schema
 *   collapses to opaque (`oneOf`/`anyOf` with no shared shape), the
 *   param falls back to `[]byte` so the caller pre-encodes JSON.
 * - `multipart/form-data` (object schema) → one param per property;
 *   binary fields become `[]byte`.
 * - `application/x-www-form-urlencoded` (object schema) → one param
 *   per property.
 * - empty / octet-stream / image / unknown → `body []byte` (caller
 *   pre-encodes).
 */
export function buildBodyParams(
  body: IR.BodyObject,
  ctx: TypeCtx,
): ReadonlyArray<GoFuncParam> {
  const shape = classifyBody(body);
  const schema = body.schema;

  switch (shape.kind) {
    case "json-opaque":
      return [goFuncParam("body", goBytes())];
    case "json-typed": {
      const t = schemaToType(schema, { ...ctx, propPath: ["body"] });
      // JSON body params are always pointer types — the standard Go
      // shape for "may be nil / required to construct on the heap".
      const finalType = t.kind === "ptr" ? t : goPtr(t);
      return [goFuncParam("body", finalType)];
    }
    case "multipart-object":
      return objectBodyToFlatParams(schema, ctx, /* binaryAsBytes */ true);
    case "form-urlencoded-object":
      return objectBodyToFlatParams(schema, ctx, /* binaryAsBytes */ false);
    case "opaque":
      return [goFuncParam("body", goBytes())];
  }
}

const isPointerable = (t: GoType): boolean =>
  t.kind !== "ptr" &&
  t.kind !== "slice" &&
  t.kind !== "map" &&
  t.kind !== "interface";

function objectBodyToFlatParams(
  schema: IR.SchemaObject,
  ctx: TypeCtx,
  binaryAsBytes: boolean,
): ReadonlyArray<GoFuncParam> {
  return Array.from(iterateObjectProperties(schema)).map(
    ({ jsonKey: propName, schema: propSchema, required, isBinary }) => {
      const t =
        binaryAsBytes && isBinary
          ? goBytes()
          : schemaToType(propSchema, { ...ctx, propPath: ["body", propName] });
      const finalType = required || !isPointerable(t) ? t : goPtr(t);
      return goFuncParam(paramIdent(propName), finalType);
    },
  );
}
