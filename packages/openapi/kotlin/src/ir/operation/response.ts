import type { IR } from "@hey-api/shared";
import { synthName } from "@ir-kit/codegen-core";
import { classifyReturnShape, isMeaningless } from "@ir-kit/openapi";

import {
  type KtType,
  ktProp,
  ktRef,
  ktSealedClass,
  ktSealedSubclass,
  ktUnit,
} from "../../kt-dsl/index.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";
import type { ResponseCase } from "./signature.js";

export interface ResolvedReturn {
  type: KtType;
  /**
   * Per-status-code cases when the op has more than one 2xx response.
   * Empty for single-2xx ops — the impl decodes straight into `type`
   * (which is `Unit` or the schema type). Non-empty means `type` is a
   * `ktRef` to an emitted sealed-class hierarchy and the impl must
   * dispatch on `response.code` to pick the matching subclass.
   */
  cases: ReadonlyArray<ResponseCase>;
}

/**
 * Resolve the success-path return shape for an op.
 *
 *  - 0 successful responses                → `Unit`
 *  - 1 successful response, empty schema   → `Unit`
 *  - 1 successful response, schema         → schema type
 *  - 2+ successful responses               → emit `<Owner>_Response`
 *    sealed-class hierarchy, return a ref + the per-status case info
 */
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
    case "multi":
      return emitMultiResponseSealed(shape.cases, ctx);
  }
}

function emitMultiResponseSealed(
  responses: ReadonlyArray<readonly [string, IR.ResponseObject | undefined]>,
  ctx: TypeCtx,
): ResolvedReturn {
  const sealedName = synthName(ctx.ownerName, ["response"]);
  const cases: ResponseCase[] = responses.map(([code, resp]) => {
    const schema = resp?.schema;
    const isVoid = !schema || isMeaningless(schema);
    const caseName = `Status${code}`;
    if (isVoid) return { statusCode: code, caseName };
    const payloadType = schemaToType(schema, {
      ...ctx,
      propPath: ["response", code],
    });
    return { statusCode: code, caseName, payloadType };
  });
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
                  inPrimary: true,
                }),
              ],
            })
          : ktSealedSubclass({ variant: "object", name: c.caseName }),
      ),
    }),
  );
  return { type: ktRef(sealedName), cases };
}
