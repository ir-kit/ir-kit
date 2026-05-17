import { HTTP_METHODS, type HttpMethod } from "@ahmedrowaihi/openapi-core";
import type { IR } from "@hey-api/shared";

export interface WalkedOperation {
  id: string;
  method: HttpMethod;
  path: string;
  summary?: string;
  description?: string;
  tags: ReadonlyArray<string>;
  pathParams: ReadonlyArray<IR.ParameterObject>;
  queryParams: ReadonlyArray<IR.ParameterObject>;
  headerParams: ReadonlyArray<IR.ParameterObject>;
  body?: IR.BodyObject;
  successSchema?: IR.SchemaObject;
  successStatus?: number;
}

/**
 * Walk paths × methods in spec order. Operations missing an `id` are
 * skipped — they can't be referenced from user code. Method `trace` is
 * dropped because k6's `http` namespace doesn't expose it.
 */
export function* walkOperations(
  paths: IR.PathsObject | undefined,
): Iterable<WalkedOperation> {
  for (const [pathStr, pathItem] of Object.entries(paths ?? {})) {
    if (!pathItem) continue;
    for (const method of HTTP_METHODS) {
      if (method === "trace") continue;
      const op = pathItem[method] as IR.OperationObject | undefined;
      if (!op || !op.id) continue;

      const params = op.parameters ?? {};
      const success = pickSuccessResponse(op.responses);

      yield {
        id: op.id,
        method: method as HttpMethod,
        path: pathStr,
        summary: op.summary,
        description: op.description,
        tags: (op as { tags?: ReadonlyArray<string> }).tags ?? [],
        pathParams: Object.values(params.path ?? {}),
        queryParams: Object.values(params.query ?? {}),
        headerParams: Object.values(params.header ?? {}),
        body: op.body,
        successSchema: success?.response.schema,
        successStatus: success?.status,
      };
    }
  }
}

function pickSuccessResponse(
  responses: IR.ResponsesObject | undefined,
): { status: number; response: IR.ResponseObject } | undefined {
  if (!responses) return undefined;
  // Prefer the lowest 2xx with a JSON-ish body.
  const codes = Object.keys(responses)
    .filter((k) => /^2\d\d$/.test(k))
    .map((k) => Number(k))
    .sort((a, b) => a - b);
  for (const status of codes) {
    const r = responses[String(status)];
    if (r) return { status, response: r };
  }
  const def = responses.default;
  return def ? { status: 200, response: def } : undefined;
}
