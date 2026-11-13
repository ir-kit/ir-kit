import type { IR } from "../../../../ir/index.js";
import {
  classifyBody,
  iterateObjectProperties,
  type Schema,
} from "../../../../openapi/index.js";

import {
  type KtFunParam,
  ktByteArray,
  ktFunParam,
  ktNullable,
} from "../../ast/index.js";
import { operationParamIdent } from "../identifiers.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";

/**
 * Resolve an `IR.Body` into function parameters for both the
 * interface signature and the impl method:
 *
 *  - `application/json` (and `+json`) → single `body: T`. Opaque
 *    schemas fall back to `ByteArray` since `Any` isn't `@Serializable`.
 *  - `multipart/form-data` + object → one param per property; binary
 *    fields become `ByteArray`.
 *  - `application/x-www-form-urlencoded` + object → one param per property.
 *  - empty / octet-stream / image / unknown → `body: ByteArray`.
 */
export function buildBodyParams(
  body: IR.Body,
  ctx: TypeCtx,
): ReadonlyArray<KtFunParam> {
  const { shape, schema } = classifyBody(body);

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
  schema: Schema,
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
        name: operationParamIdent(propName),
        type: required ? t : ktNullable(t),
        default: required ? undefined : "null",
      });
    },
  );
}
