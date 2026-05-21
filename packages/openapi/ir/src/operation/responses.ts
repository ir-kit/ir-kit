import type { IR } from "@hey-api/shared";
import { isMeaningless } from "../spec/ref.js";

/**
 * Match a 3-digit HTTP status code in the 2xx range. Treats string
 * codes only (matching hey-api's IR shape) so `"default"` and `"4XX"`
 * style buckets don't accidentally classify as success.
 */
export const isSuccessStatus = (code: string): boolean => /^2\d\d$/.test(code);

/**
 * Return the operation's 2xx responses as `[code, response]` tuples,
 * sorted by code for stable per-target emission order.
 *
 * Common pattern across emitters: 0 → no return, 1 → decode straight,
 * 2+ → emit a sum-type return that dispatches on the status code.
 */
export function successResponses(
  op: IR.OperationObject,
): Array<readonly [string, IR.ResponseObject]> {
  return Object.entries(op.responses ?? {})
    .filter(([k]) => isSuccessStatus(k))
    .sort(([a], [b]) => a.localeCompare(b)) as Array<
    readonly [string, IR.ResponseObject]
  >;
}

/**
 * One arm of a multi-2xx sum-type return. Each emitter parameterises
 * `T` with its own target type (`GoType`, `KtType`, `SwType`) for the
 * decoded payload. `payloadType` is omitted for empty bodies (e.g. 204).
 */
export interface ResponseCase<T> {
  statusCode: string;
  caseName: string;
  payloadType?: T;
}

/**
 * Shape of an operation's success return, normalised so each emitter
 * can switch on `kind` instead of re-deriving the same 4-way logic
 * (no successes, single empty, single typed, multi-case) from the
 * `successResponses` array.
 */
export type ReturnShape =
  /** Either no 2xx responses at all, or a single 2xx whose schema is
   *  empty / meaningless. Caller renders its Unit / Void analog. */
  | { kind: "void" }
  /** Single 2xx response with a non-empty schema. Caller calls
   *  `schemaToType(schema)` and uses the result as the return. */
  | { kind: "single"; schema: IR.SchemaObject }
  /** Multiple 2xx responses. Caller emits a sum-type (Go interface,
   *  Kotlin sealed class, Swift enum) and dispatches on status. */
  | {
      kind: "multi";
      cases: ReadonlyArray<readonly [string, IR.ResponseObject]>;
    };

/**
 * Classify the success-path return for an operation. Folds the
 * "0 success → void / 1 success with empty schema → void / 1 success
 * with schema → single / 2+ success → multi" decision tree into one
 * tagged union so each emitter just switches on `kind` and applies
 * its target rendering.
 */
export function classifyReturnShape(op: IR.OperationObject): ReturnShape {
  const success = successResponses(op);
  if (success.length === 0) return { kind: "void" };
  if (success.length === 1) {
    const [, resp] = success[0]!;
    if (!resp?.schema || isMeaningless(resp.schema)) return { kind: "void" };
    return { kind: "single", schema: resp.schema };
  }
  return { kind: "multi", cases: success };
}
