import type { IR } from "../../ir/index.js";
import { HTTP_METHODS, type HttpMethod } from "../spec/constants.js";

export interface IteratedOperation {
  pathStr: string;
  method: HttpMethod;
  op: IR.Operation;
}

/**
 * Walk `IR.Paths` and yield one entry per `(path, method)` that
 * carries an operation. Order is `Object.entries(paths)` → `HTTP_METHODS` —
 * stable and matches the existing emit order.
 */
export function* iterOperations(
  paths: IR.Paths | undefined,
): Generator<IteratedOperation> {
  for (const [pathStr, pathItem] of Object.entries(paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const op = pathItem[method] as IR.Operation | undefined;
      if (!op) continue;
      yield {
        pathStr,
        method: method as HttpMethod,
        op,
      };
    }
  }
}

/**
 * Group every operation under its first tag (or `defaultTag`), mapped
 * through `sign`. Tags keep first-seen order; operations keep walk order.
 */
export function groupOperationsByTag<S>(
  paths: IR.Paths | undefined,
  defaultTag: string,
  sign: (operation: IteratedOperation) => S,
): Map<string, S[]> {
  const byTag = new Map<string, S[]>();
  for (const operation of iterOperations(paths)) {
    const tag = operation.op.tags?.[0] ?? defaultTag;
    const signed = sign(operation);
    const list = byTag.get(tag);
    if (list) list.push(signed);
    else byTag.set(tag, [signed]);
  }
  return byTag;
}
