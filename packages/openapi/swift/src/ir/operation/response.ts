import type { IR } from "@hey-api/shared";
import { synthName } from "@ir-kit/codegen-core";
import { classifyReturnShape } from "@ir-kit/openapi";

import type { SwType } from "../../sw-dsl/index.js";
import {
  swAssoc,
  swEnum,
  swEnumCase,
  swRef,
  swVoid,
} from "../../sw-dsl/index.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";
import type { ResponseCase } from "./signature.js";

export interface ResolvedReturn {
  type: SwType;
  /**
   * Per-status cases for multi-2xx ops. Empty for single-2xx — impl
   * decodes straight into `type`. Non-empty means `type` is a `swRef`
   * to an emitted sum-type enum and the impl dispatches on
   * `httpResponse.statusCode`.
   */
  cases: ReadonlyArray<ResponseCase>;
}

export function returnTypeFor(
  op: IR.OperationObject,
  ctx: TypeCtx,
): ResolvedReturn {
  const shape = classifyReturnShape(op);
  switch (shape.kind) {
    case "void":
      return { type: swVoid, cases: [] };
    case "single":
      return { type: schemaToType(shape.schema, ctx), cases: [] };
    case "multi": {
      const enumName = synthName(ctx.ownerName, ["response"]);
      const cases: ResponseCase[] = shape.cases.map(
        ({ statusCode, schema }) => {
          const caseName = `status${statusCode}`;
          if (!schema) return { statusCode, caseName };
          const payloadType = schemaToType(schema, {
            ...ctx,
            propPath: ["response", statusCode],
          });
          return { statusCode, caseName, payloadType };
        },
      );
      ctx.emit(
        swEnum({
          name: enumName,
          access: "public",
          cases: cases.map((c) =>
            swEnumCase(
              c.caseName,
              undefined,
              c.payloadType ? [swAssoc(c.payloadType)] : undefined,
            ),
          ),
        }),
      );
      return { type: swRef(enumName), cases };
    }
  }
}
