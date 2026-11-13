import type { IR } from "../../../../ir/index.js";
import {
  classifyBody,
  iterateObjectProperties,
  type Schema,
} from "../../../../openapi/index.js";

import { type JParam, jBytes, jParam } from "../../ast/index.js";
import { operationParamIdent } from "../identifiers.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";

export function buildBodyParams(
  body: IR.Body,
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
        operationParamIdent(jsonKey),
        binaryAsBytes && isBinary
          ? jBytes
          : schemaToType(propSchema, { ...ctx, propPath: ["body", jsonKey] }),
      ),
  );
}
