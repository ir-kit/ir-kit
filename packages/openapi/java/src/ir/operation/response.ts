import type { IR } from "@hey-api/shared";
import { pascal, synthName } from "@ir-kit/codegen-core";
import { classifyReturnShape } from "@ir-kit/openapi";

import {
  type JType,
  jInterface,
  jParam,
  jRecord,
  jRef,
  jVoid,
} from "../../ast/index.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";
import type { ResponseCase } from "./signature.js";

export interface ResolvedReturn {
  type: JType;
  cases: ReadonlyArray<ResponseCase>;
}

/**
 * Multi-2xx operations return an interface `<Op>Response` implemented by
 * one top-level record per status, `<Op>ResponseStatus<code>`.
 */
export function returnTypeFor(
  op: IR.OperationObject,
  ctx: TypeCtx,
): ResolvedReturn {
  const shape = classifyReturnShape(op);
  switch (shape.kind) {
    case "void":
      return { type: jVoid, cases: [] };
    case "single":
      return { type: schemaToType(shape.schema, ctx), cases: [] };
    case "multi": {
      const sealedName = ctx.names.claim(
        `synth:${ctx.ownerName}/response`,
        pascal(synthName(ctx.ownerName, ["response"])),
      );
      const cases: ResponseCase[] = shape.cases.map(
        ({ statusCode, schema }) => {
          const caseName = ctx.names.claim(
            `synth:${ctx.ownerName}/response/${statusCode}`,
            `${sealedName}Status${statusCode}`,
          );
          const payloadType = schema
            ? schemaToType(schema, {
                ...ctx,
                propPath: ["response", statusCode],
              })
            : undefined;
          return { statusCode, caseName, payloadType };
        },
      );
      ctx.emit(
        jInterface({
          name: sealedName,
          methods: [],
          permits: cases.map((c) => c.caseName),
        }),
      );
      for (const c of cases) {
        ctx.emit(
          jRecord({
            name: c.caseName,
            components: c.payloadType ? [jParam("value", c.payloadType)] : [],
            implements: [sealedName],
          }),
        );
      }
      return { type: jRef(sealedName), cases };
    }
  }
}
