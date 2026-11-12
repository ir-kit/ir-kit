import type { IR } from "@hey-api/shared";
import {
  classifyBody,
  iterateObjectProperties,
  type Schema,
} from "@ir-kit/openapi";

import { type JParam, jBytes, jParam } from "../../ast/index.js";
import { paramIdent } from "../identifiers.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";

export function buildBodyParams(
  body: IR.BodyObject,
  ctx: TypeCtx,
): ReadonlyArray<JParam> {
  const { shape, schema } = classifyBody(body);
  switch (shape.kind) {
    case "json-typed":
      return [
        jParam("body", schemaToType(schema, { ...ctx, propPath: ["body"] })),
      ];
    case "multipart-object":
      return flatParams(schema, ctx, true);
    case "form-urlencoded-object":
      return flatParams(schema, ctx, false);
    case "json-opaque":
    case "opaque":
      return [jParam("body", jBytes)];
  }
}

function flatParams(
  schema: Schema,
  ctx: TypeCtx,
  binaryAsBytes: boolean,
): ReadonlyArray<JParam> {
  return Array.from(iterateObjectProperties(schema)).map(
    ({ jsonKey, schema: propSchema, isBinary }) =>
      jParam(
        paramIdent(jsonKey),
        binaryAsBytes && isBinary
          ? jBytes
          : schemaToType(propSchema, { ...ctx, propPath: ["body", jsonKey] }),
      ),
  );
}
