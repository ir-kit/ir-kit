import type { IR } from "@hey-api/shared";
import { HTTP_METHOD_LITERAL, type HttpMethod } from "@ir-kit/openapi-core";

/**
 * Derive the canonical *base* name for an operation — the unstyled
 * identifier each emitter then runs through its own case transform
 * (`exportedIdent` for Go, `camel` + `pascal` for Kotlin / Swift).
 *
 *  - When `op.operationId` is present, prefer it verbatim. Producers
 *    are expected to write it in a sensible casing already; let the
 *    emitter normalise.
 *  - Otherwise, derive from `<method>_<segments...>` with curly braces
 *    stripped from path templates. Underscore form is the lowest
 *    common denominator: PascalCase / camelCase / snake_case can all
 *    be re-derived from it.
 */
export function deriveBaseName(
  op: IR.OperationObject,
  method: HttpMethod,
  path: string,
): string {
  if (op.operationId) return op.operationId;
  const segments = path
    .split("/")
    .filter(Boolean)
    .map((s) => s.replace(/[{}]/g, ""));
  return [method, ...segments].join("_") || method;
}

/**
 * Standard one-line doc comment every emitter puts on a generated
 * operation method: `<METHOD> <path>`.
 */
export function operationDocLine(method: HttpMethod, pathStr: string): string {
  return `${HTTP_METHOD_LITERAL[method]} ${pathStr}`;
}
