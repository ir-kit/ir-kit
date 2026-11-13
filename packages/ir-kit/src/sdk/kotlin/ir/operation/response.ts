import type { IR } from "@hey-api/shared";
import { synthName } from "../../../../codegen/index.js";
import { classifyReturnShape } from "../../../../openapi/index.js";

import {
  type KtType,
  ktProp,
  ktRef,
  ktSealedClass,
  ktSealedSubclass,
  ktUnit,
} from "../../ast/index.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";
import type { ResponseCase } from "./signature.js";

export interface ResolvedReturn {
  type: KtType;
  /**
   * Per-status cases for multi-2xx ops. Empty for single-2xx — the
   * impl decodes straight into `type`. Non-empty means `type` is a
   * `ktRef` to an emitted sealed-class hierarchy and the impl
   * dispatches on `response.code`.
   */
  cases: ReadonlyArray<ResponseCase>;
  /** Name of the emitted sealed class, for multi-2xx ops. */
  sealedName?: string;
}

export function returnTypeFor(
  op: IR.OperationObject,
  ctx: TypeCtx,
): ResolvedReturn {
  const shape = classifyReturnShape(op);
  switch (shape.kind) {
    case "void":
      return { type: ktUnit, cases: [] };
    case "single":
      return { type: schemaToType(shape.schema, ctx), cases: [] };
    case "multi": {
      const sealedName = ctx.names.claim(
        `synth:${ctx.ownerName}/response`,
        synthName(ctx.ownerName, ["response"]),
      );
      const cases: ResponseCase[] = shape.cases.map(
        ({ statusCode, schema }) => {
          const caseName = `Status${statusCode}`;
          if (!schema) return { statusCode, caseName };
          const payloadType = schemaToType(schema, {
            ...ctx,
            propPath: ["response", statusCode],
          });
          return { statusCode, caseName, payloadType };
        },
      );
      ctx.emit(
        ktSealedClass({
          name: sealedName,
          subclasses: cases.map((c) =>
            c.payloadType
              ? ktSealedSubclass({
                  variant: "class",
                  name: c.caseName,
                  properties: [
                    ktProp({
                      name: "value",
                      type: c.payloadType,
                    }),
                  ],
                })
              : ktSealedSubclass({ variant: "object", name: c.caseName }),
          ),
        }),
      );
      return { type: ktRef(sealedName), cases, sealedName };
    }
  }
}
