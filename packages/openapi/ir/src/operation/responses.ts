import type { IR } from "@hey-api/shared";
import type { Schema } from "@ir-kit/schema";
import { fromHeyApi } from "@ir-kit/schema/adapters/heyapi";

import { isMeaningless } from "../spec/ref.js";

export const isSuccessStatus = (code: string): boolean => /^2\d\d$/.test(code);

/**
 * Operation's 2xx responses as `[code, response]` tuples, sorted by
 * code for stable per-target emission order.
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
 * One arm of a multi-2xx sum-type return. Status code + payload
 * schema (canonical, already converted from hey-api).
 */
export interface ResponseCase {
  statusCode: string;
  /** `undefined` for empty / meaningless responses (e.g. `204`). */
  schema: Schema | undefined;
}

/**
 * Shape of an operation's success return, normalised so each emitter
 * can switch on `kind`. Schemas are canonical {@link Schema}.
 */
export type ReturnShape =
  /** No 2xx responses, or a single 2xx with empty schema. */
  | { kind: "void" }
  /** Single 2xx with non-empty schema. */
  | { kind: "single"; schema: Schema }
  /** Multiple 2xx — emitter renders a sum type. */
  | { kind: "multi"; cases: ReadonlyArray<ResponseCase> };

export function classifyReturnShape(op: IR.OperationObject): ReturnShape {
  const success = successResponses(op);
  if (success.length === 0) return { kind: "void" };
  if (success.length === 1) {
    const [, resp] = success[0]!;
    if (!resp?.schema) return { kind: "void" };
    const schema = fromHeyApi(resp.schema);
    if (isMeaningless(schema)) return { kind: "void" };
    return { kind: "single", schema };
  }
  return {
    kind: "multi",
    cases: success.map(([statusCode, resp]) => {
      if (!resp?.schema) return { statusCode, schema: undefined };
      const schema = fromHeyApi(resp.schema);
      return {
        statusCode,
        schema: isMeaningless(schema) ? undefined : schema,
      };
    }),
  };
}
