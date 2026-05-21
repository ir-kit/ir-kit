import type { IR } from "@hey-api/shared";
import {
  HTTP_METHODS,
  type HttpMethod,
  securityKey,
} from "@ir-kit/openapi-core";

export interface IteratedOperation {
  pathStr: string;
  method: HttpMethod;
  op: IR.OperationObject;
  /** Security-scheme names resolved for this operation. Empty when no
   *  `schemeNames` map was passed or no entry matches `securityKey`. */
  schemeNames: ReadonlyArray<string>;
}

/**
 * Walk `IR.PathsObject` and yield one entry per `(path, method)` that
 * carries an operation, with security-scheme names resolved up-front.
 *
 * Centralises the path × method nested loop, the `op = pathItem[method]`
 * narrowing, and the `securityKey(pathStr, method)` lookup that every
 * emitter (`operations.ts` in go / kotlin / swift) was open-coding
 * identically. Order is `Object.entries(paths)` → `HTTP_METHODS` —
 * stable and matches the existing emit order.
 */
export function* iterOperations(
  paths: IR.PathsObject | undefined,
  schemeNames?: ReadonlyMap<string, ReadonlyArray<string>>,
): Generator<IteratedOperation> {
  for (const [pathStr, pathItem] of Object.entries(paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const op = pathItem[method] as IR.OperationObject | undefined;
      if (!op) continue;
      yield {
        pathStr,
        method: method as HttpMethod,
        op,
        schemeNames: schemeNames?.get(securityKey(pathStr, method)) ?? [],
      };
    }
  }
}
