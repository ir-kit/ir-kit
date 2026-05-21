import type { IR } from "@hey-api/shared";
import { classifyReturnShape } from "@ir-kit/openapi";

import {
  type GoType,
  goField,
  goFuncDecl,
  goInterface,
  goMethodSig,
  goPtr,
  goReceiver,
  goRef,
  goStruct,
} from "../../go-dsl/index.js";
import { synthName } from "../identifiers.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";
import type { ResponseCase } from "./signature.js";

export interface ResolvedReturn {
  /** Go type for the function's results list. `undefined` means "no
   *  return value" (results are just `error`). */
  type: GoType | undefined;
  /**
   * Per-status-code cases when the op has more than one 2xx response.
   * Empty for single-2xx ops — the impl decodes straight into `type`.
   * Non-empty means `type` is a `goRef` to an emitted interface and
   * the impl dispatches on `resp.StatusCode`.
   */
  cases: ReadonlyArray<ResponseCase>;
}

/**
 * Resolve the success-path return shape for an op.
 *
 *  - 0 successful responses                → no return type
 *  - 1 successful response, empty schema   → no return type
 *  - 1 successful response, schema         → schema type
 *  - 2+ successful responses               → emit `<Owner>Response`
 *    sealed-like interface + per-status concrete struct types
 *
 * Go's sum-type idiom: interface with one unexported marker method,
 * one struct per status implementing it. Callers do a type switch.
 *
 * @example
 * ```go
 * type SubmitJobResponse interface {
 *     isSubmitJobResponse()
 * }
 * type SubmitJobResponseStatus200 struct { Value JobResult }
 * func (SubmitJobResponseStatus200) isSubmitJobResponse() {}
 * type SubmitJobResponseStatus204 struct{}
 * func (SubmitJobResponseStatus204) isSubmitJobResponse() {}
 * ```
 */
export function returnTypeFor(
  op: IR.OperationObject,
  ctx: TypeCtx,
): ResolvedReturn {
  const shape = classifyReturnShape(op);
  switch (shape.kind) {
    case "void":
      return { type: undefined, cases: [] };
    case "single": {
      const t = schemaToType(shape.schema, ctx);
      const finalType = t.kind === "ref" || t.kind === "ptr" ? maybePtr(t) : t;
      return { type: finalType, cases: [] };
    }
    case "multi": {
      const ifaceName = synthName(ctx.ownerName, ["Response"]);
      const markerMethod = `is${ifaceName}`;
      const cases: ResponseCase[] = shape.cases.map(
        ({ statusCode, schema }) => {
          const caseName = `${ifaceName}Status${statusCode}`;
          if (!schema) return { statusCode, caseName };
          const payloadType = schemaToType(schema, {
            ...ctx,
            propPath: ["response", statusCode],
          });
          return { statusCode, caseName, payloadType };
        },
      );
      ctx.emit(
        goInterface({
          name: ifaceName,
          methods: [goMethodSig(markerMethod, [], [])],
        }),
      );
      for (const c of cases) {
        const fields = c.payloadType
          ? [goField("Value", c.payloadType, '`json:"-"`')]
          : [];
        ctx.emit(goStruct({ name: c.caseName, fields }));
        ctx.emit(
          goFuncDecl({
            name: markerMethod,
            receiver: goReceiver("", goRef(c.caseName)),
            body: [],
          }),
        );
      }
      return { type: goRef(ifaceName), cases };
    }
  }
}

function maybePtr(t: GoType): GoType {
  return t.kind === "ptr" ? t : goPtr(t);
}
