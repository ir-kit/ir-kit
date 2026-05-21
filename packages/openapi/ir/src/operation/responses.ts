import type { IR } from "@hey-api/shared";

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
