import type { IR } from "@hey-api/shared";
import {
  classifyBody,
  iterateObjectProperties,
  type Schema,
} from "@ir-kit/openapi";

import type { SwFunParam } from "../../sw-dsl/index.js";
import { swData, swFunParam, swOptional } from "../../sw-dsl/index.js";
import { paramIdent } from "../identifiers.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";

/**
 * Resolve an `IR.BodyObject` into the function parameters for both
 * protocol signature and impl method:
 *
 *  - `application/json` (and `+json`) → `body: T`. Opaque schemas
 *    fall back to `Data` since `Any` isn't `Encodable`.
 *  - `multipart/form-data` + object → one param per property; binary
 *    fields become `Data`.
 *  - `application/x-www-form-urlencoded` + object → one param per property.
 *  - empty / octet-stream / image / unknown → `body: Data`.
 */
export function buildBodyParams(
  body: IR.BodyObject,
  ctx: TypeCtx,
): ReadonlyArray<SwFunParam> {
  const { shape, schema } = classifyBody(body);

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
  schema: Schema,
  ctx: TypeCtx,
  binaryAsData: boolean,
): ReadonlyArray<SwFunParam> {
  return Array.from(iterateObjectProperties(schema)).map(
    ({ jsonKey: propName, schema: propSchema, required, isBinary }) => {
      const t =
        binaryAsData && isBinary
          ? swData
          : schemaToType(propSchema, { ...ctx, propPath: ["body", propName] });
      return swFunParam({
        name: paramIdent(propName),
        type: required ? t : swOptional(t),
        default: required ? undefined : "nil",
      });
    },
  );
}
