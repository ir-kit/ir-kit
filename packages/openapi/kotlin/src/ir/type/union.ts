import type { IR } from "@hey-api/shared";
import { classifyUnion } from "@ir-kit/openapi";

import { type KtType, ktAny, ktNullable } from "../../kt-dsl/index.js";
import type { TypeCtx } from "./context.js";
import { schemaToType } from "./index.js";
import { inlineObjectType } from "./object.js";

/**
 * IR represents 3.1 nullable types as a union schema with a `null`
 * branch (`{ items: [{type:'string'}, {type:'null'}], logicalOperator: 'or' }`).
 * `allOf` folds become `logicalOperator: 'and'`. We collapse single-branch
 * unions to the lone branch and unwrap nullable detection; unhandled
 * multi-branch unions fall back to `Any?` (preserving the nullable bit
 * since `Any` is non-null by default).
 */
export function unionToType(schema: IR.SchemaObject, ctx: TypeCtx): KtType {
  const shape = classifyUnion(schema);
  switch (shape.kind) {
    case "intersection-with-properties":
      return inlineObjectType(schema, ctx);
    case "intersection-empty":
      return ktAny;
    case "single": {
      const inner = schemaToType(shape.inner, ctx);
      return shape.nullable ? ktNullable(inner) : inner;
    }
    case "multi":
      return shape.nullable ? ktNullable(ktAny) : ktAny;
  }
}
