import type { IR } from "@hey-api/shared";
import { classifyUnion } from "@ir-kit/openapi";

import { type GoType, goAny, goPtr } from "../../go-dsl/index.js";
import type { TypeCtx } from "./context.js";
import { schemaToType } from "./index.js";
import { inlineObjectType } from "./object.js";

const isPointerable = (t: GoType): boolean =>
  t.kind !== "ptr" &&
  t.kind !== "slice" &&
  t.kind !== "map" &&
  t.kind !== "interface";

/**
 * IR represents 3.1 nullable types as a union schema with a `null`
 * branch (`{ items: [{type:'string'}, {type:'null'}], logicalOperator: 'or' }`).
 * `allOf` folds become `logicalOperator: 'and'`. We collapse single-branch
 * unions to the lone branch and unwrap nullable detection; unhandled
 * multi-branch unions fall back to `any` (Go drops the nullable bit —
 * `interface{}` already holds nil).
 */
export function unionToType(schema: IR.SchemaObject, ctx: TypeCtx): GoType {
  const shape = classifyUnion(schema);
  switch (shape.kind) {
    case "intersection-with-properties":
      return inlineObjectType(schema, ctx);
    case "intersection-empty":
      return goAny;
    case "single": {
      const inner = schemaToType(shape.inner, ctx);
      return shape.nullable && isPointerable(inner) ? goPtr(inner) : inner;
    }
    case "multi":
      return goAny;
  }
}
